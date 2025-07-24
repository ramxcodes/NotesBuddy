import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Feature";
import About from "@/components/landing/About";
import Pricing from "@/components/landing/Pricing";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notes Buddy",
  description: "Notes Buddy",
};

export default function Home() {
  return (
    <div className="font-satoshi container mx-auto min-h-screen max-w-6xl">
      <Hero />
      <About />
      <Features />
      <Pricing />
    </div>
  );
}
