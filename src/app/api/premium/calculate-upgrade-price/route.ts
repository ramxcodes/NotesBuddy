import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { PremiumTier } from "@prisma/client";
import { calculateUpgradePricing } from "@/dal/premium/query";

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
    const { tier, discountCode, useWalletBalance, walletAmount } = body;

    // Validate tier
    if (!tier || !["TIER_1", "TIER_2", "TIER_3"].includes(tier)) {
      return NextResponse.json(
        { error: "Invalid tier specified" },
        { status: 400 },
      );
    }

    // Calculate upgrade pricing
    const priceCalculation = await calculateUpgradePricing(
      session.user.id,
      tier as PremiumTier,
      discountCode,
      useWalletBalance,
      walletAmount,
    );

    return NextResponse.json(priceCalculation);
  } catch (error) {
    console.error("Error calculating upgrade price:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to calculate upgrade price",
      },
      { status: 500 },
    );
  }
}
