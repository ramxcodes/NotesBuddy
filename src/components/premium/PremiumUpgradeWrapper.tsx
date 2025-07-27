"use client";

import { useRouter } from "next/navigation";
import { PremiumTier } from "@prisma/client";
import { PremiumUpgrade } from "./PremiumUpgrade";
import { type UpgradeContext } from "@/dal/premium/types";

interface PremiumUpgradeWrapperProps {
  upgradeContext: UpgradeContext;
}

export function PremiumUpgradeWrapper({ upgradeContext }: PremiumUpgradeWrapperProps) {
  const router = useRouter();

  const handleUpgradeSelect = (tier: PremiumTier) => {
    // Redirect to purchase flow with upgrade context
    const params = new URLSearchParams({
      tier,
      upgrade: "true",
    });
    router.push(`/premium/upgrade?${params.toString()}`);
  };

  return (
    <PremiumUpgrade
      upgradeContext={upgradeContext}
      onUpgradeSelect={handleUpgradeSelect}
    />
  );
}
