import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  getUserOnboardingStatus,
  getUserFullProfile,
} from "@/dal/user/onboarding/query";
import { getUserPremiumStatus } from "@/dal/premium/query";
import { PremiumPurchaseFlow } from "@/components/premium/PremiumPurchaseFlow";
import {
  UNIVERSITY_OPTIONS,
  DEGREE_OPTIONS,
  YEAR_OPTIONS,
  SEMESTER_OPTIONS,
} from "@/utils/constant";
import { Link } from "next-view-transitions";

export default async function PremiumPage() {
  // Check authentication
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  // Check if user completed onboarding
  const onboardingStatus = await getUserOnboardingStatus(session.user.id);

  if (!onboardingStatus.isOnboarded) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        Onboarding not completed
        <Link href="/onboarding">Go to onboarding</Link>
      </div>
    );
  }

  // Get user profile and premium status
  const [userProfile, premiumStatus] = await Promise.all([
    getUserFullProfile(session.user.id),
    getUserPremiumStatus(session.user.id),
  ]);

  if (!userProfile) {
    redirect("/onboarding");
  }

  // Format user academic details for display
  const academicDetails = {
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
      SEMESTER_OPTIONS[userProfile.semester as keyof typeof SEMESTER_OPTIONS]
        ?.title || userProfile.semester,
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            Upgrade to Premium
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Unlock exclusive study materials and get ahead in your academic
            journey
          </p>
        </div>
        {!premiumStatus.isActive && (
          <>
            {/* User Academic Info */}
            <div className="mx-auto mb-8 max-w-2xl rounded-xl border border-gray-100 bg-white p-6 shadow-lg">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-800">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                Your Academic Profile
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">University:</span>
                  <p className="font-medium text-gray-800">
                    {academicDetails.university}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Degree:</span>
                  <p className="font-medium text-gray-800">
                    {academicDetails.degree}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Year:</span>
                  <p className="font-medium text-gray-800">
                    {academicDetails.year}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Semester:</span>
                  <p className="font-medium text-gray-800">
                    {academicDetails.semester}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Premium Status (if active) */}
        {premiumStatus.isActive && (
          <div className="mx-auto mb-8 max-w-2xl rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white shadow-lg">
            <h2 className="mb-2 text-xl font-semibold">🎉 Premium Active</h2>
            <p className="text-green-100">
              Your {premiumStatus.tier?.replace("_", " ")} is active with{" "}
              {premiumStatus.daysRemaining} days remaining
            </p>
            <p className="mt-1 text-sm text-green-100">
              Expires on:{" "}
              {premiumStatus.expiryDate &&
                new Date(premiumStatus.expiryDate).toLocaleDateString()}
            </p>
          </div>
        )}
        {!premiumStatus.isActive && (
          <PremiumPurchaseFlow
            userId={session.user.id}
            userEmail={session.user.email!}
            userName={`${userProfile.firstName} ${userProfile.lastName}`}
            currentPremiumStatus={premiumStatus}
          />
        )}
      </div>
    </div>
  );
}
