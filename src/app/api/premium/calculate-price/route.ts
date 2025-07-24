import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { calculatePurchasePrice } from "@/dal/premium/query";
import { purchaseRequestSchema } from "@/dal/premium/types";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = purchaseRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { tier, discountCode, referralCode, useWalletBalance, walletAmount } =
      validationResult.data;

    // Calculate price with server-side security
    const priceCalculation = await calculatePurchasePrice(
      session.user.id,
      tier,
      discountCode,
      referralCode,
      useWalletBalance,
      walletAmount,
    );

    return NextResponse.json({
      success: true,
      data: priceCalculation,
    });
  } catch (error: unknown) {
    console.error("Price calculation error:", error);
    return NextResponse.json(
      {
        error: "Failed to calculate price",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
