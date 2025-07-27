import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Notes Buddy",
  description:
    "Learn more about Notes Buddy, our mission, and how we help students learn smarter.",
};

// Force static generation
export const dynamic = "force-static";

export default function AboutPage() {
  return (
    <div className="font-satoshi container mx-auto min-h-screen max-w-6xl">
      <div className="mx-4">
        <section className="relative z-10 mt-10 flex flex-col items-center justify-center gap-8">
          <h1 className="font-excon mb-4 text-center text-4xl font-black tracking-tight text-black drop-shadow-[2px_2px_0px_rgba(0,0,0,0.8)] md:text-5xl dark:text-white">
            About Notes Buddy
          </h1>
          <p className="font-satoshi mb-6 max-w-2xl text-center text-lg font-medium text-zinc-800 md:text-xl dark:text-zinc-200">
            We make learning simple by turning boring, complicated notes into
            fun, easy-to-read notes. Whether you&apos;re preparing for exams or
            trying to understand your textbooks, Notes Buddy is here to help.
          </p>
          <ul className="mx-auto flex w-full max-w-2xl flex-col gap-4 text-left">
            <li className="rounded-lg border-2 border-black bg-zinc-100 px-6 py-4 text-lg font-bold text-black shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373]">
              • Minimal, distraction-free interface
            </li>
            <li className="rounded-lg border-2 border-black bg-zinc-100 px-6 py-4 text-lg font-bold text-black shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373]">
              • Customzation & Personalization
            </li>
            <li className="rounded-lg border-2 border-black bg-zinc-100 px-6 py-4 text-lg font-bold text-black shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373]">
              • Fast, efficient, and always accessible
            </li>
          </ul>
          <div className="mt-8 flex flex-col items-center gap-2">
            <span className="font-excon text-lg font-bold text-black dark:text-white">
              Why We built Notes Buddy
            </span>
            <p className="font-satoshi max-w-xl text-center text-base text-zinc-700 dark:text-zinc-300">
              We started Notes Buddy because, let&apos;s face it, studying
              shouldn&apos;t feel like deciphering ancient hieroglyphs!
              We&apos;ve been there lost in piles of notes, wondering
              what&apos;s important and what&apos;s just noise.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
