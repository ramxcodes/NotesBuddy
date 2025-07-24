import { auth } from "@/lib/auth/auth";
import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  getUserOnboardingStatus,
  getUserFullProfile,
} from "@/dal/user/onboarding/query";
import { getUserPremiumStatus } from "@/dal/premium/query";
import { getUserWalletBalance } from "@/dal/user/wallet";
import { PremiumPurchaseFlow } from "@/components/premium/PremiumPurchaseFlow";
import { Link } from "next-view-transitions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ShieldCheckIcon from "@/components/icons/ShieldCheckIcon";
import StarIcon from "@/components/icons/StarIcon";
import CalendarIcon from "@/components/icons/CalendarIcon";

export const metadata: Metadata = {
  title: "Premium | NotesBuddy",
  description:
    "Unlock exclusive study materials and get ahead in your academic journey",
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
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-md border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#fff]">
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
              <button className="font-excon w-full rounded-md border-2 border-black bg-white px-6 py-3 text-lg font-black text-black shadow-[2px_2px_0px_0px_#000] transition-all group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:cursor-pointer group-hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none dark:border-white dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#fff]">
                Complete Onboarding
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const [userProfile, premiumStatus] = await Promise.all([
    getUserFullProfile(session.user.id),
    getUserPremiumStatus(session.user.id),
    getUserWalletBalance(session.user.id),
  ]);

  if (!userProfile) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            {premiumStatus.isActive
              ? "Your Premium Status"
              : "Upgrade to Premium"}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            {premiumStatus.isActive
              ? "Manage your premium subscription and benefits"
              : "Upgrade to Premium for exclusive features and benefits"}
          </p>
        </div>

        {/* Premium Status (if active) */}
        {premiumStatus.isActive && (
          <Card className="mx-auto mb-8 max-w-2xl border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white dark:bg-zinc-800 dark:shadow-[4px_4px_0px_0px_#fff]">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <ShieldCheckIcon className="h-5 w-5 text-black dark:text-white" />
                <span className="font-excon text-xl font-black text-black dark:text-white">
                  Premium Active
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <StarIcon className="h-4 w-4 text-black dark:text-white" />
                <span className="font-satoshi font-bold text-black dark:text-white">
                  Your {premiumStatus.tier?.replace("_", " ")} is active with{" "}
                  <span className="font-black">
                    {premiumStatus.daysRemaining} days
                  </span>{" "}
                  remaining
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-black dark:text-white" />
                <span className="font-satoshi text-sm text-black dark:text-white">
                  Expires on:{" "}
                  {premiumStatus.expiryDate &&
                    new Date(premiumStatus.expiryDate).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
        {!premiumStatus.isActive && (
          <PremiumPurchaseFlow
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
