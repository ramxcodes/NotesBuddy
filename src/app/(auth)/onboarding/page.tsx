import { OnboardingForm } from "@/components/auth/onboarding/OnboardingForm";
import { getUserOnboardingStatus } from "@/dal/user/onboarding/query";
import { getSession } from "@/lib/db/user";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Onboarding",
  description: "Onboarding page",
};

export default async function Onboarding() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  const isOnboarded = await getUserOnboardingStatus(session.user.id);

  if (isOnboarded.isOnboarded) {
    redirect("/profile");
  }

  return (
    <>
      <OnboardingForm />
    </>
  );
}
