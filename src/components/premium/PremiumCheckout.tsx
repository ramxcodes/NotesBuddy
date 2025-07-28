"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  SpinnerIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  ClockIcon,
  LightningIcon,
} from "@phosphor-icons/react";
import { PriceCalculation, UserPremiumStatus } from "@/dal/premium/types";

interface PremiumCheckoutProps {
  priceCalculation: PriceCalculation | null;
  isProcessing: boolean;
  currentPremiumStatus: UserPremiumStatus;
  onInitiatePayment: () => void;
  isUpgrade?: boolean;
}

export function PremiumCheckout({
  priceCalculation,
  isProcessing,
  currentPremiumStatus,
  onInitiatePayment,
  isUpgrade = false,
}: PremiumCheckoutProps) {
  return (
    <motion.div className="text-center">
      <Button
        size="lg"
        className="group rounded-xl border-2 border-black bg-white px-8 py-4 text-lg font-bold text-black shadow-[4px_4px_0px_0px_#000] transition-all duration-300 hover:translate-x-[4px] hover:translate-y-[4px] hover:text-white hover:shadow-none dark:border-white/20 dark:bg-zinc-800 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373]"
        onClick={onInitiatePayment}
        disabled={
          !priceCalculation ||
          isProcessing ||
          (currentPremiumStatus.isActive && !isUpgrade)
        }
        data-umami-event={
          isUpgrade
            ? `premium-upgrade-payment-initiate-${priceCalculation?.tier || "unknown"}`
            : `premium-purchase-payment-initiate-${priceCalculation?.tier || "unknown"}`
        }
      >
        <div className="relative z-10 flex items-center gap-3">
          {isProcessing ? (
            <>
              <SpinnerIcon className="h-5 w-5 animate-spin" />
              <span className="font-excon">Processing Payment...</span>
            </>
          ) : currentPremiumStatus.isActive && !isUpgrade ? (
            <>
              <ShieldCheckIcon className="h-5 w-5" />
              <span className="font-excon">Premium Already Active</span>
            </>
          ) : (
            <>
              <CreditCardIcon className="h-5 w-5" />
              <span className="font-excon">
                {isUpgrade
                  ? `Pay ₹${priceCalculation?.finalAmount || 0} & Upgrade Now`
                  : `Pay ₹${priceCalculation?.finalAmount || 0} & Get Premium`}
              </span>
            </>
          )}
        </div>
      </Button>

      <div className="mt-4 flex items-center justify-center gap-4 text-sm text-black dark:text-white">
        <div className="flex items-center gap-1">
          <ShieldCheckIcon className="h-4 w-4" />
          <span className="font-satoshi">
            Secure payment powered by Razorpay
          </span>
        </div>
        <div className="flex items-center gap-1">
          <ClockIcon className="h-4 w-4" />
          <span className="font-satoshi">6 months access</span>
        </div>
        <div className="flex items-center gap-1">
          <LightningIcon className="h-4 w-4" />
          <span className="font-satoshi">Instant activation</span>
        </div>
      </div>
    </motion.div>
  );
}
