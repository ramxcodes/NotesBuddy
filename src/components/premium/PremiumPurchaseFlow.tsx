"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  Spinner,
  CheckCircle,
  Gift,
  Star,
  Lightning,
  CreditCard,
  ShieldCheck,
  Clock,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";
import { PremiumTier } from "@prisma/client";
import {
  getAllTierConfigs,
  TierDetails,
  type PriceCalculation,
  type UserPremiumStatus,
} from "@/dal/premium/types";

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
}

interface TierCardProps {
  tier: TierDetails;
  isSelected: boolean;
  onClick: () => void;
  delay?: number;
}

function TierCard({ tier, isSelected, onClick, delay = 0 }: TierCardProps) {
  return (
    <motion.div
      className="group relative cursor-pointer"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: delay }}
      viewport={{ once: true, amount: 0.3 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <div
        className={`relative h-full overflow-hidden rounded-2xl border-2 backdrop-blur-sm transition-all duration-300 ${
          isSelected
            ? "border-primary/50 bg-primary/5 shadow-primary/10 shadow-xl"
            : "border-border/50 bg-card hover:border-primary/30 hover:shadow-primary/5 hover:shadow-lg"
        }`}
      >
        {tier.tier === "TIER_2" && (
          <Badge className="absolute top-4 right-4 z-10 bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700">
            <Star className="mr-1 h-3 w-3" weight="fill" />
            Popular
          </Badge>
        )}

        <div className="from-primary/5 absolute inset-0 bg-gradient-to-br via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <CardHeader className="relative z-10 pb-2 text-center">
          <CardTitle className="font-excon text-foreground text-xl font-bold">
            {tier.title}
          </CardTitle>
          <CardDescription className="font-satoshi text-muted-foreground">
            {tier.description}
          </CardDescription>
          <div className="mt-6">
            <span className="font-excon text-primary text-4xl font-black">
              ₹{tier.price}
            </span>
            <span className="font-satoshi text-muted-foreground ml-1">
              /6 months
            </span>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 pt-2">
          <ul className="space-y-3">
            {tier.features.map((feature: string, index: number) => (
              <li key={index} className="flex items-start text-sm">
                <CheckCircle
                  className="mt-0.5 mr-3 h-4 w-4 flex-shrink-0 text-green-500"
                  weight="fill"
                />
                <span className="font-satoshi text-foreground">{feature}</span>
              </li>
            ))}
          </ul>

          {isSelected && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-primary/10 ring-primary/20 mt-6 rounded-xl p-4 ring-1"
            >
              <p className="font-satoshi text-primary text-sm font-medium">
                <CheckCircle className="mr-2 inline h-4 w-4" weight="fill" />
                Selected Plan
              </p>
            </motion.div>
          )}
        </CardContent>
      </div>
    </motion.div>
  );
}

export function PremiumPurchaseFlow({
  userEmail,
  userName,
  currentPremiumStatus,
}: PremiumPurchaseFlowProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State management
  const [selectedTier, setSelectedTier] = useState<PremiumTier>("TIER_1");
  const [discountCode, setDiscountCode] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [priceCalculation, setPriceCalculation] =
    useState<PriceCalculation | null>(null);
  const [error, setError] = useState("");

  const tierConfigs = getAllTierConfigs();

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
  }, [searchParams]);

  // Update URL when state changes
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("tier", selectedTier);
    if (discountCode.trim()) {
      params.set("code", discountCode.trim());
    }
    router.replace(`/premium?${params.toString()}`);
  }, [selectedTier, discountCode, router]);

  // Calculate price when tier or discount changes
  useEffect(() => {
    calculatePrice();
  }, [selectedTier, discountCode]);

  const calculatePrice = async () => {
    setIsCalculating(true);
    setError("");

    try {
      const response = await fetch("/api/premium/calculate-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: selectedTier,
          discountCode: discountCode.trim() || undefined,
          referralCode: discountCode.trim() || undefined, // Same input for both
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
          color: "#3B82F6",
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
    <div className="relative mx-auto max-w-6xl overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0" />

      <div className="relative z-10">
        {/* Header Section */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h1 className="font-excon text-foreground mb-4 text-4xl font-black tracking-tight md:text-5xl lg:text-6xl">
            Choose Your Plan
          </h1>
          <p className="font-satoshi text-muted-foreground mx-auto max-w-2xl text-lg md:text-xl">
            Unlock the full potential of your learning journey with premium
            features
          </p>
        </motion.div>

        {/* Tier Selection */}
        <div className="mb-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {tierConfigs.map((tier, index) => (
            <TierCard
              key={tier.tier}
              tier={tier}
              isSelected={selectedTier === tier.tier}
              onClick={() => setSelectedTier(tier.tier)}
              delay={index * 0.1}
            />
          ))}
        </div>

        {/* Discount Code Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <Card className="border-border/50 bg-card/50 mx-auto max-w-2xl backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-center">
                <Gift className="h-6 w-6 text-purple-500" weight="duotone" />
                <span className="font-excon text-xl font-bold">
                  Have a discount or referral code?
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Input
                  placeholder="Enter code (e.g., STUDENT10, FRIEND123)"
                  value={discountCode}
                  onChange={(e) =>
                    setDiscountCode(e.target.value.toUpperCase())
                  }
                  className="font-satoshi border-border/50 bg-background/50 flex-1 backdrop-blur-sm"
                />
                <Button
                  variant="outline"
                  onClick={calculatePrice}
                  disabled={isCalculating}
                  className="font-satoshi border-border/50 bg-background/50 backdrop-blur-sm"
                >
                  {isCalculating ? (
                    <Spinner className="h-4 w-4 animate-spin" />
                  ) : (
                    "Apply"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Price Summary */}
        <AnimatePresence>
          {priceCalculation && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="border-primary/20 from-primary/5 mx-auto mb-8 max-w-2xl border-2 bg-gradient-to-br to-transparent backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Lightning
                      className="text-primary h-6 w-6"
                      weight="duotone"
                    />
                    <span className="font-excon text-xl font-bold">
                      Price Summary
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-lg">
                      <span className="font-satoshi">Original Price:</span>
                      <span className="font-excon font-bold">
                        ₹{priceCalculation.originalAmount}
                      </span>
                    </div>

                    {priceCalculation.discounts.map((discount, index) => (
                      <div
                        key={index}
                        className="flex justify-between text-green-600 dark:text-green-400"
                      >
                        <span className="font-satoshi">
                          {discount.description}:
                        </span>
                        <span className="font-excon font-bold">
                          -₹{discount.amount}
                        </span>
                      </div>
                    ))}

                    <hr className="border-border/50" />
                    <div className="flex justify-between text-2xl font-bold">
                      <span className="font-excon">Total:</span>
                      <span className="font-excon text-primary">
                        ₹{priceCalculation.finalAmount}
                      </span>
                    </div>

                    {priceCalculation.totalDiscount > 0 && (
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-satoshi text-center text-green-600 dark:text-green-400"
                      >
                        🎉 You save ₹{priceCalculation.totalDiscount}!
                      </motion.p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="mx-auto mb-6 max-w-2xl rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
            >
              <p className="font-satoshi">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Purchase Button */}
        <motion.div className="text-center">
          <Button
            size="lg"
            className="group from-primary hover:from-primary/90 hover:shadow-primary/25 relative overflow-hidden bg-gradient-to-r to-purple-600 px-8 py-4 text-lg font-bold transition-all duration-300 hover:to-purple-600/90 hover:shadow-lg"
            onClick={initiatePayment}
            disabled={
              !priceCalculation || isProcessing || currentPremiumStatus.isActive
            }
          >
            <div className="relative z-10 flex items-center gap-3">
              {isProcessing ? (
                <>
                  <Spinner className="h-5 w-5 animate-spin" />
                  <span className="font-excon">Processing Payment...</span>
                </>
              ) : currentPremiumStatus.isActive ? (
                <>
                  <ShieldCheck className="h-5 w-5" weight="fill" />
                  <span className="font-excon">Premium Already Active</span>
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5" weight="duotone" />
                  <span className="font-excon">
                    Pay ₹{priceCalculation?.finalAmount || 0} & Upgrade Now
                  </span>
                </>
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </Button>

          <div className="text-muted-foreground mt-4 flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <ShieldCheck className="h-4 w-4" weight="duotone" />
              <span className="font-satoshi">
                Secure payment powered by Razorpay
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" weight="duotone" />
              <span className="font-satoshi">6 months access</span>
            </div>
            <div className="flex items-center gap-1">
              <Lightning className="h-4 w-4" weight="duotone" />
              <span className="font-satoshi">Instant activation</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
