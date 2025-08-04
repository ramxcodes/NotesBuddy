"use client";

import { motion } from "motion/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreditCardIcon, CheckCircleIcon } from "@phosphor-icons/react";

interface PremiumWalletSectionProps {
  walletBalance: number;
  useWalletBalance: boolean;
  onUseWalletBalanceChange: (use: boolean) => void;
}

export function PremiumWalletSection({
  walletBalance,
  useWalletBalance,
  onUseWalletBalanceChange,
}: PremiumWalletSectionProps) {
  if (walletBalance <= 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      viewport={{ once: true }}
    >
      <Card className="rounded-md border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[4px_4px_0px_0px_#757373]">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <CreditCardIcon className="h-5 w-5 text-black dark:text-white" />
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
            <div className="flex items-center justify-between rounded-md border-2 border-black bg-white p-4 shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:shadow-[2px_2px_0px_0px_#757373]">
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
                  onChange={(e) => onUseWalletBalanceChange(e.target.checked)}
                  disabled={walletBalance <= 0}
                  className="sr-only"
                  data-umami-event={`premium-wallet-toggle-${useWalletBalance ? "off" : "on"}`}
                />
                <label
                  htmlFor="useWalletBalance"
                  className={`relative flex h-6 w-11 rounded-full border-2 border-black transition-colors dark:border-white/20 ${
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
                    className={`inline-block h-4 w-4 transform rounded-full border-2 border-black bg-white transition-transform dark:border-white/20 dark:bg-zinc-900 ${
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
                className="rounded-md border-2 border-black bg-white p-4 shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:shadow-[2px_2px_0px_0px_#757373]"
              >
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="h-4 w-4 text-black dark:text-white" />
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
  );
}
