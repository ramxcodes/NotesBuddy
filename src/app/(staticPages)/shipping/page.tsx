import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping | Notes Buddy",
  description: "Learn about our shipping policy and how to track your order.",
};

// Force static generation
export const dynamic = "force-static";

export default function ShippingPage() {
  return (
    <section className="relative z-10 my-20 mt-10 flex flex-col items-center justify-center gap-8">
      <h1 className="font-excon mb-2 text-center text-4xl font-black tracking-tight text-black drop-shadow-[2px_2px_0px_rgba(0,0,0,0.8)] md:text-5xl dark:text-white">
        Shipping and Delivery Policy
      </h1>
      <p className="font-satoshi mb-2 text-center text-base text-zinc-600 dark:text-zinc-300">
        Last updated: Jan 18, 2025
      </p>
      <div className="flex w-full max-w-2xl flex-col gap-8">
        <section className="rounded-xl border-2 border-black bg-zinc-100 p-6 shadow-[4px_4px_0px_0px_#000] dark:border-white dark:bg-zinc-900 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373]">
          <h2 className="font-excon mb-2 text-2xl font-bold">
            Shipping and Delivery Policy for Notes Buddy
          </h2>
          <p className="font-satoshi text-base">
            At Notes Buddy, we specialize in providing premium educational
            resources tailored for students. Our goal is to deliver high-quality
            notes and resources efficiently and effectively.
          </p>
        </section>
        <section className="rounded-xl border-2 border-black bg-zinc-100 p-6 shadow-[4px_4px_0px_0px_#000] dark:border-white dark:bg-zinc-900 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373]">
          <h2 className="font-excon mb-2 text-xl font-bold">
            Service Availability
          </h2>
          <p className="font-satoshi text-base">
            Our notes and educational materials are available to students
            globally, ensuring that no matter where you are, you can benefit
            from our resources.
          </p>
        </section>
        <section className="rounded-xl border-2 border-black bg-zinc-100 p-6 shadow-[4px_4px_0px_0px_#000] dark:border-white dark:bg-zinc-900 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373]">
          <h2 className="font-excon mb-2 text-xl font-bold">
            Delivery Timeline
          </h2>
          <ul className="font-satoshi list-disc pl-6 text-base">
            <li>
              <span className="font-bold">Instant Access:</span> Digital notes
              and flashcards are available immediately after purchase.
            </li>
          </ul>
        </section>
        <section className="rounded-xl border-2 border-black bg-zinc-100 p-6 shadow-[4px_4px_0px_0px_#000] dark:border-white dark:bg-zinc-900 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373]">
          <h2 className="font-excon mb-2 text-xl font-bold">
            Cost and Payment
          </h2>
          <ul className="font-satoshi list-disc pl-6 text-base">
            <li>
              <span className="font-bold">Free Tier:</span> Access to a limited
              selection of notes.
            </li>
            <li>
              <span className="font-bold">Pro Tier:</span> Premium notes,
              one-shots, and flashcards at an affordable rate.
            </li>
            <li>
              <span className="font-bold">Ultimate Tier:</span> Comprehensive
              resources including past-year questions (PYQs), advanced
              flashcards, and exclusive notes.
            </li>
          </ul>
          <p className="font-satoshi mt-2 text-base">
            Payment options will be available during checkout and vary by
            region.
          </p>
        </section>
        <section className="rounded-xl border-2 border-black bg-zinc-100 p-6 shadow-[4px_4px_0px_0px_#000] dark:border-white dark:bg-zinc-900 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373]">
          <h2 className="font-excon mb-2 text-xl font-bold">
            Tracking and Updates
          </h2>
          <p className="font-satoshi text-base">
            We provide continuous updates on your order status via email.
            Digital materials can be accessed immediately after purchase through
            your Notes Buddy account.
          </p>
        </section>
        <section className="rounded-xl border-2 border-black bg-zinc-100 p-6 shadow-[4px_4px_0px_0px_#000] dark:border-white dark:bg-zinc-900 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373]">
          <h2 className="font-excon mb-2 text-xl font-bold">
            No Return Policy
          </h2>
          <p className="font-satoshi text-base">
            Due to the digital nature of our products, we do not offer returns.
            However, we strive to ensure that all resources meet your
            expectations and offer support for any issues.
          </p>
        </section>
      </div>
    </section>
  );
}
