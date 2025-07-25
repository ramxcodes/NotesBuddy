/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PremiumTier } from "@prisma/client";
import {
  type PriceCalculation,
  type UserPremiumStatus,
} from "@/dal/premium/types";
import { PremiumAcademicProfile } from "./PremiumAcademicProfile";
import { PremiumTierSelection } from "./PremiumTierSelection";
import { PremiumDiscountCode } from "./PremiumDiscountCode";
import { PremiumWalletSection } from "./PremiumWalletSection";
import { PremiumPriceSummary } from "./PremiumPriceSummary";
import { PremiumErrorDisplay } from "./PremiumErrorDisplay";
import { PremiumCheckout } from "./PremiumCheckout";

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      new (options: any): {
        open: () => void;
      };
    };
  }
}

interface PremiumPurchaseFlowProps {
  userId: string;
  userEmail: string;
  userName: string;
  currentPremiumStatus: UserPremiumStatus;
  userProfile?: {
    university: string;
    degree: string;
    year: string;
    semester: string;
  };
}

export function PremiumPurchaseFlowController({
  userEmail,
  userName,
  currentPremiumStatus,
  userProfile,
}: PremiumPurchaseFlowProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State management
  const [selectedTier, setSelectedTier] = useState<PremiumTier>("TIER_1");
  const [discountCode, setDiscountCode] = useState("");
  const [useWalletBalance, setUseWalletBalance] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [priceCalculation, setPriceCalculation] =
    useState<PriceCalculation | null>(null);
  const [error, setError] = useState("");

  // Initialize from URL params
  useEffect(() => {
    const tierFromUrl = searchParams.get("tier") as PremiumTier;
    const codeFromUrl = searchParams.get("code");

    if (tierFromUrl && ["TIER_1", "TIER_2", "TIER_3"].includes(tierFromUrl)) {
      setSelectedTier(tierFromUrl);
    }

    if (codeFromUrl) {
      setDiscountCode(codeFromUrl);
    }

    // Fetch wallet balance
    fetchWalletBalance();
  }, [searchParams]);

  // Fetch wallet balance
  const fetchWalletBalance = async () => {
    try {
      const response = await fetch("/api/user/wallet-balance");
      if (response.ok) {
        const data = await response.json();
        setWalletBalance(data.walletBalance || 0);
      }
    } catch (err) {
      console.error("Failed to fetch wallet balance:", err);
    }
  };

  // Update URL when state changes
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("tier", selectedTier);
    if (discountCode.trim()) {
      params.set("code", discountCode.trim());
    }
    router.replace(`/premium?${params.toString()}`);
  }, [selectedTier, discountCode, router]);

  // Calculate price when tier, discount, or wallet usage changes
  useEffect(() => {
    calculatePrice();
  }, [selectedTier, discountCode, useWalletBalance]);

  // Reset wallet usage if balance is 0
  useEffect(() => {
    if (walletBalance <= 0) {
      setUseWalletBalance(false);
    }
  }, [walletBalance]);

  const calculatePrice = async () => {
    setIsCalculating(true);
    setError("");

    // Validate wallet usage
    if (useWalletBalance && walletBalance <= 0) {
      setError("Insufficient wallet balance");
      setIsCalculating(false);
      return;
    }

    try {
      const response = await fetch("/api/premium/calculate-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: selectedTier,
          discountCode: discountCode.trim() || undefined,
          referralCode: discountCode.trim() || undefined, // Same input for both
          useWalletBalance: useWalletBalance,
          walletAmount: useWalletBalance ? walletBalance : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to calculate price");
      }

      setPriceCalculation(data.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      setPriceCalculation(null);
    } finally {
      setIsCalculating(false);
    }
  };

  const initiatePayment = async () => {
    if (!priceCalculation) return;

    // Validate wallet usage before payment
    if (useWalletBalance && walletBalance <= 0) {
      setError("Insufficient wallet balance for discount");
      return;
    }

    // Validate final amount
    if (priceCalculation.finalAmount < 0) {
      setError("Invalid payment amount calculated");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      // Create Razorpay order
      const orderResponse = await fetch("/api/premium/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: selectedTier,
          discountCode: discountCode.trim() || undefined,
          referralCode: discountCode.trim() || undefined,
          useWalletBalance: useWalletBalance,
          walletAmount: useWalletBalance ? walletBalance : undefined,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.message || "Failed to create order");
      }

      // Initialize Razorpay payment
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        name: "Notes Buddy",
        description: `${priceCalculation.tier.replace("_", " ")} - 6 Months`,
        order_id: orderData.data.orderId,
        prefill: {
          name: userName,
          email: userEmail,
        },
        theme: {
          color: "#000000",
        },
        handler: async (response: RazorpayResponse) => {
          await verifyPayment(response);
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      setIsProcessing(false);
    }
  };

  const verifyPayment = async (paymentResponse: RazorpayResponse) => {
    try {
      const verifyResponse = await fetch("/api/premium/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_signature: paymentResponse.razorpay_signature,
        }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        throw new Error(verifyData.message || "Payment verification failed");
      }

      // Success - redirect to success page or refresh
      router.push("/premium?success=true");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? `Payment verification failed: ${err.message}`
          : "Unknown error occurred",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="relative mx-auto max-w-4xl overflow-hidden">
      <div className="relative z-10 space-y-8">
        {/* Academic Information */}
        {userProfile && <PremiumAcademicProfile userProfile={userProfile} />}

        {/* Tier Selection */}
        <PremiumTierSelection
          selectedTier={selectedTier}
          onTierChange={setSelectedTier}
        />

        {/* Discount Code Section */}
        <PremiumDiscountCode
          discountCode={discountCode}
          onDiscountCodeChange={setDiscountCode}
          onApplyCode={calculatePrice}
          isCalculating={isCalculating}
          validationMessage={
            error && discountCode.trim()
              ? "Invalid or expired coupon code"
              : priceCalculation?.discounts.find(
                    (d) => d.type === "COUPON" || d.type === "REFERRAL",
                  )
                ? `${priceCalculation.discounts.find((d) => d.type === "COUPON" || d.type === "REFERRAL")?.description} applied!`
                : undefined
          }
          isValidCode={
            priceCalculation?.discounts.some(
              (d) => d.type === "COUPON" || d.type === "REFERRAL",
            ) || false
          }
          appliedDiscount={
            priceCalculation?.discounts.find(
              (d) => d.type === "COUPON" || d.type === "REFERRAL",
            ) || null
          }
        />

        {/* Wallet Balance Section */}
        <PremiumWalletSection
          walletBalance={walletBalance}
          useWalletBalance={useWalletBalance}
          onUseWalletBalanceChange={setUseWalletBalance}
        />

        {/* Price Summary */}
        <PremiumPriceSummary priceCalculation={priceCalculation} />

        {/* Error Display */}
        <PremiumErrorDisplay error={error} />

        {/* Purchase Button */}
        <PremiumCheckout
          priceCalculation={priceCalculation}
          isProcessing={isProcessing}
          currentPremiumStatus={currentPremiumStatus}
          onInitiatePayment={initiatePayment}
        />
      </div>
    </div>
  );
}
