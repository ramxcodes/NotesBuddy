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
  title: "AI Study Assistant - Personalized Learning Support",
  description:
    "Get instant help with your studies using our AI-powered chat assistant. Ask questions, get explanations, and receive personalized study guidance to improve your academic performance.",
  keywords: [
    "AI chat",
    "study assistant",
    "AI tutor",
    "educational AI",
    "learning support",
    "academic help",
    "personalized learning",
  ],
  openGraph: {
    title: "AI Study Assistant - Personalized Learning Support | Notes Buddy",
    description:
      "Get instant help with your studies using our AI-powered chat assistant. Ask questions, get explanations, and receive personalized study guidance.",
    url: "https://notesbuddy.in/ai",
    siteName: "Notes Buddy",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Study Assistant - Personalized Learning Support",
    description:
      "Get instant help with your studies using our AI-powered chat assistant.",
    site: "@notesbuddy",
    creator: "@notesbuddy",
  },
  alternates: {
    canonical: "https://notesbuddy.in/ai",
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

export default async function AIPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/");
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
