import Hero from "@/components/landing/Hero";
import About from "@/components/landing/About";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notes Buddy",
  description: "Notes Buddy",
};

export default function Home() {
  return (
    <div className="container mx-auto min-h-screen font-satoshi max-w-6xl">
      <Hero />
      <About />
    </div>
  );
}
