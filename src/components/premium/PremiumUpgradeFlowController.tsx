/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PremiumTier } from "@prisma/client";
import {
  type PriceCalculation,
  type UserPremiumStatus,
  type UpgradeContext,
} from "@/dal/premium/types";
import { PremiumUpgrade } from "./PremiumUpgrade";
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

interface PremiumUpgradeFlowProps {
  userId: string;
  userEmail: string;
  userName: string;
  currentPremiumStatus: UserPremiumStatus;
  upgradeContext: UpgradeContext;
  userProfile?: {
    university: string;
    degree: string;
    year: string;
    semester: string;
  };
}

export function PremiumUpgradeFlowController({
  userEmail,
  userName,
  upgradeContext,
}: PremiumUpgradeFlowProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State management
  const [selectedTier, setSelectedTier] = useState<PremiumTier | undefined>();
  const [discountCode, setDiscountCode] = useState("");
  const [useWalletBalance, setUseWalletBalance] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [priceCalculation, setPriceCalculation] =
    useState<PriceCalculation | null>(null);
  const [error, setError] = useState("");
  const [discountValidation, setDiscountValidation] = useState<{
    isValidCode?: boolean;
    validationMessage?: string;
    appliedDiscount?: {
      type: string;
      code: string;
      amount: number;
      description: string;
    } | null;
  }>({});

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
    const params = new URLSearchParams(searchParams);

    if (selectedTier) {
      params.set("tier", selectedTier);
    } else {
      params.delete("tier");
    }

    if (discountCode) {
      params.set("code", discountCode);
    } else {
      params.delete("code");
    }

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", newUrl);
  }, [selectedTier, discountCode]);

  // Calculate price when parameters change
  useEffect(() => {
    if (selectedTier) {
      calculateUpgradePrice();
    } else {
      setPriceCalculation(null);
    }
  }, [selectedTier, discountCode, useWalletBalance]);

  const calculateUpgradePrice = async () => {
    if (!selectedTier) return;

    setIsCalculating(true);
    setError("");

    try {
      const response = await fetch("/api/premium/calculate-upgrade-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: selectedTier,
          discountCode: discountCode || undefined,
          useWalletBalance,
          walletAmount: useWalletBalance ? walletBalance : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to calculate price");
      }

      setPriceCalculation(data);

      // Update discount validation based on the response
      if (discountCode && data.discounts && data.discounts.length > 0) {
        const discount = data.discounts[0]; // Get the first discount
        setDiscountValidation({
          isValidCode: true,
          validationMessage: "Discount applied successfully!",
          appliedDiscount: {
            type: discount.type,
            code: discountCode,
            amount: discount.amount,
            description: discount.description,
          },
        });
      } else if (discountCode) {
        setDiscountValidation({
          isValidCode: false,
          validationMessage: "Invalid or expired discount code",
          appliedDiscount: null,
        });
      } else {
        setDiscountValidation({});
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to calculate price",
      );
      setPriceCalculation(null);
      setDiscountValidation({
        isValidCode: false,
        validationMessage: "Failed to validate discount code",
        appliedDiscount: null,
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleUpgradeConfirm = async () => {
    if (!selectedTier || !priceCalculation) return;

    setIsProcessing(true);
    setError("");

    try {
      // Create order
      const orderResponse = await fetch("/api/premium/create-upgrade-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: selectedTier,
          discountCode: discountCode || undefined,
          useWalletBalance,
          walletAmount: useWalletBalance ? walletBalance : undefined,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.error || "Failed to create order");
      }

      // Handle zero amount (fully discounted)
      if (priceCalculation.finalAmount === 0) {
        const verifyResponse = await fetch("/api/premium/verify-upgrade", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: orderData.razorpayOrderId,
            paymentId: "free_upgrade",
            signature: "free_upgrade",
          }),
        });

        if (verifyResponse.ok) {
          router.push("/premium?upgrade=success");
          return;
        }
      }

      // Load Razorpay script
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => initializeRazorpay(orderData);
      document.body.appendChild(script);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to process upgrade",
      );
      setIsProcessing(false);
    }
  };

  const initializeRazorpay = (orderData: { razorpayOrderId: string }) => {
    if (!priceCalculation) return;

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      amount: Math.round(priceCalculation.finalAmount * 100),
      currency: "INR",
      name: "NotesBuddy",
      description: `Upgrade to ${selectedTier?.replace("_", " ")}`,
      order_id: orderData.razorpayOrderId,
      prefill: {
        name: userName,
        email: userEmail,
      },
      theme: {
        color: "#000000",
      },
      handler: async (response: RazorpayResponse) => {
        try {
          const verifyResponse = await fetch("/api/premium/verify-upgrade", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            }),
          });

          if (verifyResponse.ok) {
            router.push("/premium?upgrade=success");
          } else {
            const errorData = await verifyResponse.json();
            setError(errorData.error || "Payment verification failed");
          }
        } catch {
          setError("Payment verification failed");
        } finally {
          setIsProcessing(false);
        }
      },
      modal: {
        ondismiss: () => {
          setIsProcessing(false);
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleDiscountCodeChange = (code: string) => {
    setDiscountCode(code);
    // Clear validation when user is typing or when code is empty
    if (code !== discountCode || !code.trim()) {
      setDiscountValidation({});
    }
  };

  return (
    <div className="space-y-8">
      {error && <PremiumErrorDisplay error={error} />}

      {/* Upgrade Selection */}
      <PremiumUpgrade
        upgradeContext={upgradeContext}
        onUpgradeSelect={setSelectedTier}
        selectedUpgradeTier={selectedTier}
        isLoading={isCalculating}
      />

      {selectedTier && (
        <>
          {/* Discount Code Section */}
          <PremiumDiscountCode
            discountCode={discountCode}
            onDiscountCodeChange={handleDiscountCodeChange}
            onApplyCode={calculateUpgradePrice}
            isCalculating={isCalculating}
            validationMessage={discountValidation.validationMessage}
            isValidCode={discountValidation.isValidCode}
            appliedDiscount={discountValidation.appliedDiscount}
          />

          {/* Wallet Section */}
          <PremiumWalletSection
            walletBalance={walletBalance}
            useWalletBalance={useWalletBalance}
            onUseWalletBalanceChange={setUseWalletBalance}
          />

          {/* Price Summary */}
          {priceCalculation && (
            <PremiumPriceSummary priceCalculation={priceCalculation} />
          )}

          {/* Checkout */}
          <PremiumCheckout
            priceCalculation={priceCalculation}
            isProcessing={isProcessing}
            currentPremiumStatus={{
              isActive: true,
              tier: upgradeContext.currentTier,
              expiryDate: upgradeContext.expiryDate,
              daysRemaining: upgradeContext.daysRemaining,
            }}
            onInitiatePayment={handleUpgradeConfirm}
            isUpgrade={true}
          />
        </>
      )}
    </div>
  );
}
