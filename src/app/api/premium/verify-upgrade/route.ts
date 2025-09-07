import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { verifyRazorpaySignature } from "@/lib/razorpay/config";
import prisma from "@/lib/db/prisma";
import { revalidateTag } from "next/cache";
import telegramBot, {
  type PaymentNotificationData,
} from "@/lib/telegram/telegramBot";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { orderId, paymentId, signature } = body;

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        { error: "Missing payment verification data" },
        { status: 400 },
      );
    }

    // Find the premium purchase
    const purchase = await prisma.premiumPurchase.findFirst({
      where: {
        razorpayOrderId: orderId,
        userId: session.user.id,
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!purchase) {
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 },
      );
    }

    // Handle free upgrades (no payment verification needed)
    if (paymentId === "free_upgrade" && signature === "free_upgrade") {
      if (purchase.finalAmount.toNumber() === 0) {
        // Send Telegram notification for free upgrade
        try {
          const notificationData: PaymentNotificationData = {
            userName: purchase.user.name || "Unknown User",
            email: purchase.user.email,
            phone: purchase.user.profile?.phoneNumber || undefined,
            paymentAmount: "0.00",
            tier: purchase.tier,
            university: purchase.university,
            degree: purchase.degree,
            year: purchase.year,
            semester: purchase.semester,
            isSuccess: true,
            paymentId: "free_upgrade",
            orderId: orderId,
          };

          await telegramBot.sendPaymentNotification(notificationData);
        } catch {}

        return NextResponse.json({ success: true });
      } else {
        return NextResponse.json(
          { error: "Invalid free upgrade attempt" },
          { status: 400 },
        );
      }
    }

    // Verify Razorpay signature for paid upgrades
    const isValidSignature = verifyRazorpaySignature(
      orderId,
      paymentId,
      signature,
    );

    if (!isValidSignature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 },
      );
    }

    // Update the purchase record
    await prisma.premiumPurchase.update({
      where: { id: purchase.id },
      data: {
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
        paymentStatus: "CAPTURED",
        isActive: true,
        webhookProcessed: true,
      },
    });

    // Deactivate all other premium purchases for this user
    await prisma.premiumPurchase.updateMany({
      where: {
        userId: session.user.id,
        isActive: true,
        id: { not: purchase.id },
      },
      data: { isActive: false },
    });

    // Update user's premium status
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        currentPremiumTier: purchase.tier,
        premiumExpiryDate: purchase.expiryDate,
        isPremiumActive: true,
      },
    });

    // Update wallet balance if it was used
    if (purchase.discountAmount.toNumber() > 0) {
      const discounts = await prisma.purchaseDiscount.findMany({
        where: { purchaseId: purchase.id },
      });

      const walletDiscount = discounts.find(
        (d) =>
          d.discountType === "FIXED_AMOUNT" &&
          d.description?.includes("wallet"),
      );

      if (walletDiscount) {
        await prisma.user.update({
          where: { id: session.user.id },
          data: {
            walletBalance: {
              decrement: walletDiscount.discountAmount,
            },
          },
        });
      }
    }

    // Send Telegram notification for successful upgrade
    try {
      const notificationData: PaymentNotificationData = {
        userName: purchase.user.name || "Unknown User",
        email: purchase.user.email,
        phone: purchase.user.profile?.phoneNumber || undefined,
        paymentAmount: purchase.finalAmount.toString(),
        tier: purchase.tier,
        university: purchase.university,
        degree: purchase.degree,
        year: purchase.year,
        semester: purchase.semester,
        isSuccess: true,
        paymentId: paymentId,
        orderId: orderId,
      };

      await telegramBot.sendPaymentNotification(notificationData);
    } catch {}

    // Revalidate premium-related caches to ensure UI reflects the upgrade
    revalidateTag("user-premium-status");
    revalidateTag("user-purchase-history");
    revalidateTag("user-referral-status");
    revalidateTag("user-wallet-balance");
    revalidateTag("user-wallet-history");

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to verify upgrade payment",
      },
      { status: 500 },
    );
  }
}
