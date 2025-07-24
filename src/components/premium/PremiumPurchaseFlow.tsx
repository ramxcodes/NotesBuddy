/* eslint-disable react-hooks/exhaustive-deps */
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
  SpinnerIcon,
  CheckCircleIcon,
  GiftIcon,
  StarIcon,
  LightningIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  ClockIcon,
  UserIcon,
  GraduationCapIcon,
  CalendarIcon,
  BookOpenIcon,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";
import { PremiumTier } from "@prisma/client";
import {
  getAllTierConfigs,
  TierDetails,
  type PriceCalculation,
  type UserPremiumStatus,
} from "@/dal/premium/types";
import {
  UNIVERSITY_OPTIONS,
  DEGREE_OPTIONS,
  YEAR_OPTIONS,
  SEMESTER_OPTIONS,
} from "@/utils/constant";

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

interface TierBenefitsProps {
  tier: TierDetails;
}

function TierBenefits({ tier }: TierBenefitsProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-excon text-lg font-bold">What&apos;s included:</h3>
      <div className="space-y-2">
        {tier.features.map((feature, index) => (
          <div key={index} className="flex items-center gap-3">
            <CheckCircleIcon
              className="text-foreground h-4 w-4"
              type="duotone"
            />
            <span className="font-satoshi text-sm">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PremiumPurchaseFlow({
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

  const tierConfigs = getAllTierConfigs();
  const selectedTierConfig = tierConfigs.find((t) => t.tier === selectedTier);

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

  // Format academic details for display
  const academicDetails = userProfile
    ? {
        university:
          UNIVERSITY_OPTIONS[
            userProfile.university as keyof typeof UNIVERSITY_OPTIONS
          ]?.title || userProfile.university,
        degree:
          DEGREE_OPTIONS[userProfile.degree as keyof typeof DEGREE_OPTIONS]
            ?.title || userProfile.degree,
        year:
          YEAR_OPTIONS[userProfile.year as keyof typeof YEAR_OPTIONS]?.title ||
          userProfile.year,
        semester:
          SEMESTER_OPTIONS[
            userProfile.semester as keyof typeof SEMESTER_OPTIONS
          ]?.title || userProfile.semester,
      }
    : null;

  return (
    <div className="relative mx-auto max-w-4xl overflow-hidden">
      <div className="relative z-10 space-y-8">
        {/* Academic Information */}
        {academicDetails && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="rounded-xl border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white dark:bg-zinc-800 dark:shadow-[4px_4px_0px_0px_#757373]">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <UserIcon
                    className="h-5 w-5 text-black dark:text-white"
                    type="duotone"
                  />
                  <span className="font-excon text-xl font-black text-black dark:text-white">
                    Academic Profile
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <GraduationCapIcon
                      className="h-4 w-4 text-black dark:text-white"
                      type="duotone"
                    />
                    <div>
                      <span className="font-satoshi font-bold text-black dark:text-white">
                        University:
                      </span>
                      <p className="font-satoshi font-bold text-black dark:text-white">
                        {academicDetails.university}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpenIcon
                      className="h-4 w-4 text-black dark:text-white"
                      type="duotone"
                    />
                    <div>
                      <span className="font-satoshi font-bold text-black dark:text-white">
                        Degree:
                      </span>
                      <p className="font-satoshi font-bold text-black dark:text-white">
                        {academicDetails.degree}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon
                      className="h-4 w-4 text-black dark:text-white"
                      type="duotone"
                    />
                    <div>
                      <span className="font-satoshi font-bold text-black dark:text-white">
                        Year:
                      </span>
                      <p className="font-satoshi font-bold text-black dark:text-white">
                        {academicDetails.year}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarIcon
                      className="h-4 w-4 text-black dark:text-white"
                      type="duotone"
                    />
                    <div>
                      <span className="font-satoshi font-bold text-black dark:text-white">
                        Semester:
                      </span>
                      <p className="font-satoshi font-bold text-black dark:text-white">
                        {academicDetails.semester}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Tier Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
        >
          <Card className="rounded-xl border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white dark:bg-zinc-800 dark:shadow-[4px_4px_0px_0px_#757373]">
            <CardHeader>
              <CardTitle className="font-excon text-xl font-black text-black dark:text-white">
                Select Your Plan
              </CardTitle>
              <CardDescription className="font-satoshi font-bold text-black dark:text-white">
                Choose the plan that best fits your study needs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Select
                  value={selectedTier}
                  onValueChange={(value) =>
                    setSelectedTier(value as PremiumTier)
                  }
                >
                  <SelectTrigger className="rounded-xl border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000] dark:border-white dark:bg-zinc-900 dark:shadow-[2px_2px_0px_0px_#757373]">
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000] dark:border-white dark:bg-zinc-900 dark:shadow-[2px_2px_0px_0px_#757373]">
                    {tierConfigs.map((tier) => (
                      <SelectItem
                        key={tier.tier}
                        value={tier.tier}
                        className="font-satoshi font-bold text-black dark:text-white"
                      >
                        <div className="flex w-full items-center justify-between">
                          <span>{tier.title}</span>
                          {tier.tier === "TIER_2" && (
                            <Badge
                              variant="secondary"
                              className="font-satoshi ml-2 rounded-xl border-2 border-black bg-white font-black text-black shadow-[2px_2px_0px_0px_#000] dark:border-white dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373]"
                            >
                              Popular
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedTierConfig && (
                  <div className="rounded-xl border-2 border-black bg-white p-4 shadow-[2px_2px_0px_0px_#000] dark:border-white dark:bg-zinc-900 dark:shadow-[2px_2px_0px_0px_#757373]">
                    <TierBenefits tier={selectedTierConfig} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Discount Code Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Card className="rounded-xl border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white dark:bg-zinc-800 dark:shadow-[4px_4px_0px_0px_#757373]">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <GiftIcon
                  className="h-5 w-5 text-black dark:text-white"
                  type="duotone"
                />
                <span className="font-excon text-xl font-black text-black dark:text-white">
                  Discount Code
                </span>
              </CardTitle>
              <CardDescription className="font-satoshi font-bold text-black dark:text-white">
                Have a discount or referral code? Enter it below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Input
                  placeholder="Enter code (e.g., STUDENT10, FRIEND123)"
                  value={discountCode}
                  onChange={(e) =>
                    setDiscountCode(e.target.value.toUpperCase())
                  }
                  className="font-satoshi flex-1 rounded-xl border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] dark:border-white dark:bg-zinc-900 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373]"
                />
                <Button
                  variant="outline"
                  onClick={calculatePrice}
                  disabled={isCalculating}
                  className="font-satoshi rounded-xl border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none dark:border-white dark:bg-zinc-900 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373]"
                >
                  {isCalculating ? (
                    <SpinnerIcon
                      className="h-4 w-4 animate-spin text-black dark:text-white"
                      type="duotone"
                    />
                  ) : (
                    "Apply"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Wallet Balance Section */}
        {walletBalance > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <Card className="rounded-xl border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white dark:bg-zinc-800 dark:shadow-[4px_4px_0px_0px_#757373]">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <CreditCardIcon
                    className="h-5 w-5 text-black dark:text-white"
                    type="duotone"
                  />
                  <span className="font-excon text-xl font-black text-black dark:text-white">
                    Wallet Balance
                  </span>
                </CardTitle>
                <CardDescription className="font-satoshi font-bold text-black dark:text-white">
                  Use your referral earnings to get a discount
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-xl border-2 border-black bg-white p-4 shadow-[2px_2px_0px_0px_#000] dark:border-white dark:bg-zinc-900 dark:shadow-[2px_2px_0px_0px_#757373]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black dark:bg-white">
                        <span className="font-excon text-sm font-black text-white dark:text-black">
                          ₹
                        </span>
                      </div>
                      <div>
                        <p className="font-satoshi font-bold text-black dark:text-white">
                          Available Balance
                        </p>
                        <p className="font-excon text-lg font-black text-black dark:text-white">
                          ₹{walletBalance}
                        </p>
                        {walletBalance <= 0 && (
                          <p className="font-satoshi text-xs text-gray-500 dark:text-gray-400">
                            Earn more through referrals
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="useWalletBalance"
                        checked={useWalletBalance}
                        onChange={(e) => setUseWalletBalance(e.target.checked)}
                        disabled={walletBalance <= 0}
                        className="sr-only"
                      />
                      <label
                        htmlFor="useWalletBalance"
                        className={`relative flex h-6 w-11 rounded-full border-2 border-black transition-colors dark:border-white ${
                          walletBalance <= 0
                            ? "cursor-not-allowed opacity-50"
                            : "cursor-pointer"
                        } ${
                          useWalletBalance
                            ? "bg-black dark:bg-white"
                            : "bg-white dark:bg-zinc-900"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full border-2 border-black bg-white transition-transform dark:border-white dark:bg-zinc-900 ${
                            useWalletBalance ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </label>
                    </div>
                  </div>

                  {useWalletBalance && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="rounded-xl border-2 border-black bg-white p-4 shadow-[2px_2px_0px_0px_#000] dark:border-white dark:bg-zinc-900 dark:shadow-[2px_2px_0px_0px_#757373]"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircleIcon
                          className="h-4 w-4 text-black dark:text-white"
                          type="duotone"
                        />
                        <span className="font-satoshi text-sm font-bold text-black dark:text-white">
                          Wallet discount will be applied at checkout
                        </span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Price Summary */}
        <AnimatePresence>
          {priceCalculation && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="rounded-xl border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white dark:bg-zinc-800 dark:shadow-[4px_4px_0px_0px_#757373]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <LightningIcon
                      className="h-5 w-5 text-black dark:text-white"
                      type="duotone"
                    />
                    <span className="font-excon text-xl font-black text-black dark:text-white">
                      Price Summary
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-lg">
                      <span className="font-satoshi font-bold text-black dark:text-white">
                        Original Price:
                      </span>
                      <span className="font-excon font-black text-black dark:text-white">
                        ₹{priceCalculation.originalAmount}
                      </span>
                    </div>

                    {priceCalculation.discounts.map((discount, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="font-satoshi font-bold text-black dark:text-white">
                          {discount.description}:
                        </span>
                        <span className="font-excon font-black text-black dark:text-white">
                          -₹{discount.amount}
                        </span>
                      </div>
                    ))}

                    <Separator className="border-2 border-black dark:border-white" />

                    <div className="flex justify-between text-2xl font-bold">
                      <span className="font-excon font-black text-black dark:text-white">
                        Total:
                      </span>
                      <span className="font-excon font-black text-black dark:text-white">
                        ₹{priceCalculation.finalAmount}
                      </span>
                    </div>

                    {priceCalculation.totalDiscount > 0 && (
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-satoshi text-center font-bold text-black dark:text-white"
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
              className="mx-auto rounded-xl border-2 border-black bg-white p-4 text-black shadow-[2px_2px_0px_0px_#000] dark:border-white dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373]"
            >
              <p className="font-satoshi">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Purchase Button */}
        <motion.div className="text-center">
          <Button
            size="lg"
            className="group rounded-xl border-2 border-black bg-white px-8 py-4 text-lg font-bold text-black shadow-[4px_4px_0px_0px_#000] transition-all duration-300 hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none dark:border-white dark:bg-zinc-800 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373]"
            onClick={initiatePayment}
            disabled={
              !priceCalculation || isProcessing || currentPremiumStatus.isActive
            }
          >
            <div className="relative z-10 flex items-center gap-3">
              {isProcessing ? (
                <>
                  <SpinnerIcon
                    className="h-5 w-5 animate-spin"
                    type="duotone"
                  />
                  <span className="font-excon">Processing Payment...</span>
                </>
              ) : currentPremiumStatus.isActive ? (
                <>
                  <ShieldCheckIcon className="h-5 w-5" type="duotone" />
                  <span className="font-excon">Premium Already Active</span>
                </>
              ) : (
                <>
                  <CreditCardIcon className="h-5 w-5" type="duotone" />
                  <span className="font-excon">
                    Pay ₹{priceCalculation?.finalAmount || 0} & Upgrade Now
                  </span>
                </>
              )}
            </div>
          </Button>

          <div className="mt-4 flex items-center justify-center gap-4 text-sm text-black dark:text-white">
            <div className="flex items-center gap-1">
              <ShieldCheckIcon className="h-4 w-4" type="duotone" />
              <span className="font-satoshi">
                Secure payment powered by Razorpay
              </span>
            </div>
            <div className="flex items-center gap-1">
              <ClockIcon className="h-4 w-4" type="duotone" />
              <span className="font-satoshi">6 months access</span>
            </div>
            <div className="flex items-center gap-1">
              <LightningIcon className="h-4 w-4" type="duotone" />
              <span className="font-satoshi">Instant activation</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
