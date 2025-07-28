import { auth } from "@/lib/auth/auth";
import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  getUserOnboardingStatus,
  getUserFullProfile,
} from "@/dal/user/onboarding/query";
import {
  getUserPremiumStatus,
  getUserUpgradeContext,
} from "@/dal/premium/query";
import { getUserWalletBalance } from "@/dal/user/wallet";
import { PremiumHeader } from "@/components/premium/PremiumHeader";
import { PremiumPurchasedUserDisplayMessage } from "@/components/premium/PremiumPurchasedUserDisplayMessage";
import { PremiumUpgradeFlowController } from "@/components/premium/PremiumUpgradeFlowController";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "next-view-transitions";
import { XCircleIcon } from "@/components/icons/XCIrcleIcon";

export const metadata: Metadata = {
  title: "Upgrade Plan | NotesBuddy",
  description: "Upgrade your premium plan to get more features and benefits",
};

export default async function PremiumUpgradePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const onboardingStatus = await getUserOnboardingStatus(session.user.id);

  if (!onboardingStatus.isOnboarded) {
    redirect("/onboarding");
  }

  const [userProfile, premiumStatus, upgradeContext] = await Promise.all([
    getUserFullProfile(session.user.id),
    getUserPremiumStatus(session.user.id),
    getUserUpgradeContext(session.user.id),
    getUserWalletBalance(session.user.id),
  ]);

  if (!userProfile) {
    redirect("/onboarding");
  }

  // Redirect if user doesn't have active premium
  if (!premiumStatus.isActive) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto max-w-5xl px-4 py-8">
          <PremiumHeader isActive={false} />

          <div className="flex min-h-[50vh] items-center justify-center">
            <Card className="w-full max-w-md border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#757373]">
              <CardHeader>
                <CardTitle className="font-excon flex items-center gap-2 text-xl font-black text-black dark:text-white">
                  <XCircleIcon className="h-6 w-6 text-red-500" />
                  No Active Premium Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="font-satoshi font-bold text-black dark:text-white">
                  You need an active premium plan before you can upgrade. Please
                  purchase a plan first.
                </p>
                <Link href="/premium">
                  <button 
                    className="font-excon w-full rounded-md border-2 border-black bg-white px-6 py-3 text-lg font-black text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none dark:border-white/20 dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373]"
                    data-umami-event="premium-upgrade-page-buy-premium-button-click"
                  >
                    Buy Premium Plan
                  </button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Redirect if no upgrade context (shouldn't happen if premium is active)
  if (!upgradeContext) {
    redirect("/premium");
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <PremiumHeader isActive={premiumStatus.isActive} />

        {/* Premium Status */}
        <PremiumPurchasedUserDisplayMessage premiumStatus={premiumStatus} />

        {/* Upgrade Flow */}
        <PremiumUpgradeFlowController
          userId={session.user.id}
          userEmail={session.user.email!}
          userName={`${userProfile.firstName} ${userProfile.lastName}`}
          currentPremiumStatus={premiumStatus}
          upgradeContext={upgradeContext}
          userProfile={{
            university: userProfile.university,
            degree: userProfile.degree,
            year: userProfile.year,
            semester: userProfile.semester,
          }}
        />
      </div>
    </div>
  );
}
