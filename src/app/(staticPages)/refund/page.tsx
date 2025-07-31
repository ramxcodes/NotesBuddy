import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy - Money Back Guarantee",
  description:
    "Learn about our refund policy and how to request a refund for your premium subscription. We offer flexible refund options to ensure customer satisfaction.",
  keywords: [
    "refund policy",
    "money back guarantee",
    "refund request",
    "customer satisfaction",
    "subscription refund",
  ],
  alternates: {
    canonical: `${process.env.NEXT_WEBSITE_URL || "http://stag.notesbuddy.in"}/refund`,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
  },
};

// Force static generation
export const dynamic = "force-static";

export default function RefundPage() {
  return (
    <section className="relative z-10 my-20 mt-10 flex flex-col items-center justify-center gap-8">
      <h1 className="font-excon mb-2 text-center text-4xl font-black tracking-tight text-black drop-shadow-[2px_2px_0px_rgba(0,0,0,0.8)] md:text-5xl dark:text-white">
        Refund Policy
      </h1>
      <p className="font-satoshi mb-2 text-center text-base text-zinc-600 dark:text-zinc-300">
        Last updated: Jan 18, 2025
      </p>
      <div className="flex w-full max-w-2xl flex-col gap-8">
        <section className="rounded-xl border-2 border-black bg-zinc-100 p-6 shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373]">
          <h2 className="font-excon mb-2 text-2xl font-bold">
            Refund Policy for Notes Buddy
          </h2>
          <p className="font-satoshi text-base">
            At Notes Buddy, we provide digital educational resources. Due to the
            nature of our products, all sales are final and we do not offer
            refunds once a purchase is completed.
          </p>
        </section>
        <section className="rounded-xl border-2 border-black bg-zinc-100 p-6 shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373]">
          <h2 className="font-excon mb-2 text-xl font-bold">No Refunds</h2>
          <p className="font-satoshi text-base">
            All purchases of digital notes, flashcards, and other resources are
            non-refundable. Please review your order carefully before completing
            your purchase.
          </p>
        </section>
        <section className="rounded-xl border-2 border-black bg-zinc-100 p-6 shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373]">
          <h2 className="font-excon mb-2 text-xl font-bold">Exceptions</h2>
          <p className="font-satoshi text-base">
            If you experience technical issues or do not receive access to your
            purchased materials, please contact us. We will work with you to
            resolve any problems and ensure you receive the resources you paid
            for.
          </p>
        </section>
        <section className="rounded-xl border-2 border-black bg-zinc-100 p-6 shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373]">
          <h2 className="font-excon mb-2 text-xl font-bold">Contact Us</h2>
          <p className="font-satoshi text-base">
            If you have questions or concerns about this refund policy, please
            feel free to contact us.
          </p>
        </section>
      </div>
    </section>
  );
}
