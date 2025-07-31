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
import { PremiumPurchaseFlowController } from "@/components/premium/PremiumPurchaseFlowController";
import { PremiumHeader } from "@/components/premium/PremiumHeader";
import { PremiumPurchasedUserDisplayMessage } from "@/components/premium/PremiumPurchasedUserDisplayMessage";
import { PremiumUpgradeWrapper } from "@/components/premium/PremiumUpgradeWrapper";
import { Link } from "next-view-transitions";
import ShieldCheckIcon from "@/components/icons/ShieldCheckIcon";

export const metadata: Metadata = {
  title: "Premium Membership - Unlock Advanced Learning Features",
  description:
    "Upgrade to Premium and unlock exclusive study materials, advanced AI features, unlimited quiz attempts, and premium flashcard sets. Take your academic performance to the next level.",
  keywords: [
    "premium",
    "subscription",
    "upgrade",
    "exclusive content",
    "advanced features",
    "study materials",
    "academic success",
  ],
  openGraph: {
    title:
      "Premium Membership - Unlock Advanced Learning Features | Notes Buddy",
    description:
      "Upgrade to Premium and unlock exclusive study materials, advanced AI features, unlimited quiz attempts, and premium flashcard sets.",
    url: `${process.env.NEXT_PUBLIC_WEBSITE_URL || "http://stag.notesbuddy.in"}/premium`,
    siteName: "Notes Buddy",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Premium Membership - Unlock Advanced Learning Features",
    description:
      "Upgrade to Premium and unlock exclusive study materials, advanced AI features, unlimited quiz attempts, and premium flashcard sets.",
    site: "@notesbuddy",
    creator: "@notesbuddy",
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_WEBSITE_URL || "http://stag.notesbuddy.in"}/premium`,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function PremiumPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const onboardingStatus = await getUserOnboardingStatus(session.user.id);

  if (!onboardingStatus.isOnboarded) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Header Section */}
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-md border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#757373]">
              <ShieldCheckIcon className="h-8 w-8 text-black dark:text-white" />
            </div>
            <div className="space-y-2">
              <h1 className="font-excon text-3xl font-black tracking-tight text-black dark:text-white">
                Complete Onboarding First
              </h1>
              <p className="font-satoshi mx-auto max-w-sm text-lg font-bold text-black dark:text-white">
                You need to complete your profile setup before accessing premium
                features.
              </p>
            </div>
          </div>

          <div className="group p-6 text-center hover:cursor-pointer">
            <Link href="/onboarding">
              <button className="font-excon w-full rounded-md border-2 border-black bg-white px-6 py-3 text-lg font-black text-black shadow-[2px_2px_0px_0px_#000] transition-all group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:cursor-pointer group-hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none dark:border-white/20 dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373]">
                Complete Onboarding
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
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

  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <PremiumHeader isActive={premiumStatus.isActive} />

        {/* Premium Status (if active) */}
        <PremiumPurchasedUserDisplayMessage premiumStatus={premiumStatus} />

        {/* Show upgrade options if user has active premium */}
        {premiumStatus.isActive && upgradeContext && (
          <PremiumUpgradeWrapper upgradeContext={upgradeContext} />
        )}

        {!premiumStatus.isActive && (
          <PremiumPurchaseFlowController
            userId={session.user.id}
            userEmail={session.user.email!}
            userName={`${userProfile.firstName} ${userProfile.lastName}`}
            currentPremiumStatus={premiumStatus}
            userProfile={{
              university: userProfile.university,
              degree: userProfile.degree,
              year: userProfile.year,
              semester: userProfile.semester,
            }}
          />
        )}
      </div>
    </div>
  );
}
