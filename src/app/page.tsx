import Features from "@/components/landing/Feature";
import About from "@/components/landing/About";
import Pricing from "@/components/landing/Pricing";
import Testimonial from "@/components/landing/Testimonial";
import FAQ from "@/components/landing/FAQ";
import { Metadata } from "next";
import HeroSection from "@/components/landing/HeroSection";

export const metadata: Metadata = {
  title: "Notes Buddy - Study Smarter with AI-Powered Learning",
  description:
    "Transform your learning experience with Notes Buddy - Access comprehensive study notes, interactive flashcards, AI-powered quizzes, and personalized study assistance. Join thousands of students achieving academic excellence.",
  keywords: [
    "study notes",
    "flashcards",
    "AI learning",
    "education",
    "student resources",
    "academic notes",
    "quiz platform",
    "study tools",
    "online learning",
    "exam preparation",
  ],
  openGraph: {
    title: "Notes Buddy - Study Smarter with AI-Powered Learning",
    description:
      "Transform your learning experience with Notes Buddy - Access comprehensive study notes, interactive flashcards, AI-powered quizzes, and personalized study assistance.",
    url: process.env.NEXT_WEBSITE_URL || "http://stag.notesbuddy.in",
    siteName: "Notes Buddy",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Notes Buddy - Study Smarter with AI-Powered Learning",
    description:
      "Transform your learning experience with Notes Buddy - Access comprehensive study notes, interactive flashcards, AI-powered quizzes, and personalized study assistance.",
    site: "@notesbuddy",
    creator: "@notesbuddy",
  },
  alternates: {
    canonical:process.env.NEXT_WEBSITE_URL || "http://stag.notesbuddy.in",
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

// Force static generation
export const dynamic = "force-static";

export default function Home() {
  return (
    <div className="font-satoshi container mx-auto min-h-screen max-w-6xl">
      <div className="mx-4">
        <HeroSection />
        <About />
        <Features />
        <Pricing />
        <Testimonial />
        <FAQ />
      </div>
    </div>
  );
}
