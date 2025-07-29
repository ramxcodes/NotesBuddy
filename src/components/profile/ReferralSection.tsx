"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Copy, Gift, Users, Coins, QrCode, Check } from "@phosphor-icons/react";
import {
  handleGenerateReferralCode,
  handleValidateReferralCode,
  handleGetReferralStatus,
} from "@/dal/referral/actions";
import { ReferralStatus, ReferralValidation } from "@/dal/referral/types";

interface ReferralSectionProps {
  initialReferralStatus?: ReferralStatus;
}

export function ReferralSection({
  initialReferralStatus,
}: ReferralSectionProps) {
  const [referralStatus, setReferralStatus] = useState<ReferralStatus | null>(
    initialReferralStatus || null,
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [testCode, setTestCode] = useState("");
  const [validationResult, setValidationResult] =
    useState<ReferralValidation | null>(null);
  const [copied, setCopied] = useState(false);

  // Load referral status on component mount
  const loadReferralStatus = useCallback(async () => {
    try {
      const result = await handleGetReferralStatus();
      if (result.success && result.data) {
        setReferralStatus(result.data);
      } else {
        toast.error(result.message || "Failed to load referral information");
      }
    } catch {
      toast.error("Failed to load referral information");
    }
  }, []);

  useEffect(() => {
    if (!initialReferralStatus) {
      loadReferralStatus();
    }
  }, [initialReferralStatus, loadReferralStatus]);

  const handleGenerateCode = async () => {
    setIsGenerating(true);
    try {
      const result = await handleGenerateReferralCode();

      if (result.success) {
        toast.success(result.message);
        // Load fresh referral status to show the new code
        await loadReferralStatus();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to generate referral code");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCode = async () => {
    if (!referralStatus?.referralCode) return;

    try {
      await navigator.clipboard.writeText(referralStatus.referralCode);
      setCopied(true);
      toast.success("Referral code copied to clipboard!");

      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy referral code");
    }
  };

  const handleValidateCode = async () => {
    if (!testCode.trim()) return;

    setIsValidating(true);
    try {
      const result = await handleValidateReferralCode(testCode.trim());
      setValidationResult(result);

      if (result.isValid) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to validate referral code");
    } finally {
      setIsValidating(false);
    }
  };

  if (!referralStatus) {
    return (
      <div className="space-y-6">
        <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#757373]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent dark:border-white/20 dark:border-t-transparent"></div>
                <p className="font-satoshi font-bold text-black dark:text-white">
                  Loading referral information...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Referral Overview */}
      <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#757373]">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Gift
              className="h-5 w-5 text-black dark:text-white"
              weight="duotone"
            />
            <span className="font-excon text-xl font-black text-black dark:text-white">
              Referral Program
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats */}
          <div className="flex flex-col gap-4 md:flex-row md:justify-between">
            <div className="rounded-md border-2 border-black bg-white p-4 shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[2px_2px_0px_0px_#757373]">
              <div className="flex items-center gap-2">
                <Users
                  className="h-5 w-5 text-black dark:text-white"
                  weight="duotone"
                />
                <div>
                  <p className="text-sm font-black text-black dark:text-white">
                    Total Referrals
                  </p>
                  <p className="font-excon text-2xl font-black text-black dark:text-white">
                    {referralStatus.totalReferrals}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-md border-2 border-black bg-white p-4 shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[2px_2px_0px_0px_#757373]">
              <div className="flex items-center gap-2">
                <Coins
                  className="h-5 w-5 text-black dark:text-white"
                  weight="duotone"
                />
                <div>
                  <p className="text-sm font-black text-black dark:text-white">
                    Available Balance
                  </p>
                  <p className="font-excon text-2xl font-black text-black dark:text-white">
                    ₹{referralStatus.totalEarnings}
                  </p>
                </div>
              </div>
            </div>

            <div className="min-w-fit rounded-md border-2 border-black bg-white p-4 shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[2px_2px_0px_0px_#757373]">
              <div className="flex items-center gap-2">
                <QrCode
                  className="h-5 w-5 text-black dark:text-white"
                  weight="duotone"
                />
                <div>
                  <p className="text-sm font-black text-black dark:text-white">
                    Referral Code
                  </p>
                  <p className="font-excon text-lg font-black text-nowrap text-black dark:text-white">
                    {referralStatus.hasReferralCode
                      ? referralStatus.referralCode
                      : "Not Generated"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator className="bg-black dark:bg-white" />

          {/* How it works */}
          <div className="rounded-md border-2 border-black bg-white p-4 shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[2px_2px_0px_0px_#757373]">
            <h4 className="font-excon mb-3 font-black text-black dark:text-white">
              HOW IT WORKS
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <div className="mt-1 h-2 w-2 rounded-full bg-black dark:bg-white"></div>
                <p className="font-satoshi font-bold text-black dark:text-white">
                  Generate your unique referral code below
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-1 h-2 w-2 rounded-full bg-black dark:bg-white"></div>
                <p className="font-satoshi font-bold text-black dark:text-white">
                  Share it with friends who want to purchase premium
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-1 h-2 w-2 rounded-full bg-black dark:bg-white"></div>
                <p className="font-satoshi font-bold text-black dark:text-white">
                  Both you and your friend get ₹10 discount when they make a
                  purchase
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-1 h-2 w-2 rounded-full bg-black dark:bg-white"></div>
                <p className="font-satoshi font-bold text-black dark:text-white">
                  Your earnings go to your wallet and can be used for future
                  purchases
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-1 h-2 w-2 rounded-full bg-black dark:bg-white"></div>
                <p className="font-satoshi font-bold text-black dark:text-white">
                  You cannot use your own referral code
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generate/Manage Referral Code */}
      <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#757373]">
        <CardHeader>
          <CardTitle className="font-excon text-xl font-black text-black dark:text-white">
            Your Referral Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {referralStatus.hasReferralCode ? (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={referralStatus.referralCode || ""}
                  readOnly
                  className="border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373]"
                />
                <Button
                  onClick={handleCopyCode}
                  className="border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:hover:shadow-[3px_3px_0px_0px_#757373]"
                >
                  {copied ? (
                    <Check className="h-4 w-4" weight="bold" />
                  ) : (
                    <Copy className="h-4 w-4" weight="duotone" />
                  )}
                </Button>
              </div>

              <div className="rounded-md border-2 border-black bg-white p-3 shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[2px_2px_0px_0px_#757373]">
                <p className="font-satoshi text-sm font-bold text-black dark:text-white">
                  💡 Share this code with friends when they&apos;re purchasing
                  premium plans. Both of you will get ₹10 off!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="font-satoshi font-bold text-black dark:text-white">
                Generate your unique referral code to start earning rewards!
              </p>

              <Button
                onClick={handleGenerateCode}
                disabled={isGenerating}
                className="border-2 border-black bg-black font-bold text-white shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] disabled:opacity-50 dark:border-white/20 dark:bg-white dark:text-black dark:shadow-[2px_2px_0px_0px_#757373] dark:hover:shadow-[3px_3px_0px_0px_#757373]"
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent dark:border-black dark:border-t-transparent"></div>
                    Generating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4" weight="duotone" />
                    Generate Referral Code
                  </div>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Referral Code Validator */}
      <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#757373]">
        <CardHeader>
          <CardTitle className="font-excon text-xl font-black text-black dark:text-white">
            Test Referral Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="font-satoshi font-bold text-black dark:text-white">
            Enter a referral code to check if it&apos;s valid for your account:
          </p>

          <div className="flex gap-2">
            <Input
              value={testCode}
              onChange={(e) => setTestCode(e.target.value.toUpperCase())}
              placeholder="Enter referral code..."
              className="border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373]"
            />
            <Button
              onClick={handleValidateCode}
              disabled={isValidating || !testCode.trim()}
              className="border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] disabled:opacity-50 dark:border-white/20 dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:hover:shadow-[3px_3px_0px_0px_#757373]"
            >
              {isValidating ? "Checking..." : "Validate"}
            </Button>
          </div>

          {validationResult && (
            <div
              className={`rounded-md border-2 p-3 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#757373] ${
                validationResult.isValid && validationResult.canUse
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                  : "border-red-500 bg-red-50 dark:bg-red-900/20"
              }`}
            >
              <p className="font-satoshi font-bold text-black dark:text-white">
                {validationResult.message}
              </p>

              {validationResult.referrerInfo && (
                <div className="mt-2">
                  <p className="font-satoshi text-sm font-bold text-black dark:text-white">
                    Referrer: {validationResult.referrerInfo.name} (
                    {validationResult.referrerInfo.email})
                  </p>
                </div>
              )}

              {validationResult.discountAmount && (
                <div className="mt-2">
                  <Badge className="border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373]">
                    ₹{validationResult.discountAmount} Discount
                  </Badge>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Referral History */}
      {referralStatus.referrals.length > 0 && (
        <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#757373]">
          <CardHeader>
            <CardTitle className="font-excon text-xl font-black text-black dark:text-white">
              Referral History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {referralStatus.referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="rounded-md border-2 border-black bg-white p-4 shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[2px_2px_0px_0px_#757373]"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-satoshi font-bold text-black dark:text-white">
                        {referral.refereeName} • {referral.refereeEmail}
                      </p>
                      <p className="font-satoshi text-sm font-bold text-gray-600 dark:text-gray-400">
                        {referral.purchaseTier} • ₹{referral.purchaseAmount} •{" "}
                        {new Date(referral.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-excon font-black text-black dark:text-white">
                        ₹{referral.rewardAmount}
                      </p>
                      <Badge
                        variant={referral.isProcessed ? "default" : "secondary"}
                        className="border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373]"
                      >
                        {referral.isProcessed ? "Processed" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
