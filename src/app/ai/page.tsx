import { Suspense } from "react";
import { getSession } from "@/lib/db/user";
import { redirect } from "next/navigation";
import AIChatInterface from "@/components/ai/AIChatInterface";
import { getUserChats } from "@/dal/ai/chat";
import {
  getUserFullProfile,
  getUserOnboardingStatus,
} from "@/dal/user/onboarding/query";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Chat",
  description: "Chat with AI for study assistance",
};

export default async function AIPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const [userChats, userProfile, onboardingStatus] = await Promise.all([
    getUserChats(session.user.id),
    getUserFullProfile(session.user.id),
    getUserOnboardingStatus(session.user.id),
  ]);

  return (
    <div className="h-screen overflow-hidden" data-lenis-prevent>
      <Suspense>
        <AIChatInterface
          userChats={userChats}
          userId={session.user.id}
          userProfile={userProfile}
          isOnboarded={onboardingStatus.isOnboarded || false}
        />
      </Suspense>
    </div>
  );
}
