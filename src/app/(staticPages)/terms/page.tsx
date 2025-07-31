import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions - Service Agreement",
  description:
    "Read our terms and conditions that govern the use of Notes Buddy platform and services. Understanding your rights and responsibilities as a user.",
  keywords: [
    "terms and conditions",
    "service agreement",
    "user agreement",
    "legal terms",
    "platform rules",
  ],
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_WEBSITE_URL || "http://stag.notesbuddy.in"}/terms`,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
  },
};

// Force static generation
export const dynamic = "force-static";

export default function TermsPage() {
  return (
    <section className="relative z-10 my-20 mt-10 flex flex-col items-center justify-center gap-8">
      <h1 className="font-excon mb-2 text-center text-4xl font-black tracking-tight text-black drop-shadow-[2px_2px_0px_rgba(0,0,0,0.8)] md:text-5xl dark:text-white">
        Terms and Conditions
      </h1>
      <p className="font-satoshi mb-2 text-center text-base text-zinc-600 dark:text-zinc-300">
        Last updated: Jan 18, 2025
      </p>
      <div className="flex w-full max-w-2xl flex-col gap-8">
        <section className="rounded-xl border-2 border-black bg-zinc-100 p-6 shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373]">
          <h2 className="font-excon mb-2 text-2xl font-bold">
            Welcome to Notes Buddy
          </h2>
          <p className="font-satoshi text-base">
            These terms and conditions outline the rules and regulations for the
            use of Notes Buddy’s website and services. By accessing or using our
            website, you agree to these terms in full. If you do not accept all
            the terms and conditions, please refrain from using our services.
          </p>
        </section>
        <section className="rounded-xl border-2 border-black bg-zinc-100 p-6 shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373]">
          <h2 className="font-excon mb-2 text-xl font-bold">User Accounts</h2>
          <p className="font-satoshi text-base">
            To access certain features, you may need to create an account. You
            agree to provide accurate and complete information and are
            responsible for safeguarding your account credentials. Notes Buddy
            is not liable for unauthorized account usage.
          </p>
        </section>
        <section className="rounded-xl border-2 border-black bg-zinc-100 p-6 shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373]">
          <h2 className="font-excon mb-2 text-xl font-bold">
            Content Ownership
          </h2>
          <p className="font-satoshi text-base">
            The notes and resources shared on Notes Buddy are either
            user-contributed or owned by Notes Buddy. By uploading materials,
            you grant us a non-exclusive, royalty-free license to use, display,
            and share your content with other users.
          </p>
        </section>
        <section className="rounded-xl border-2 border-black bg-zinc-100 p-6 shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373]">
          <h2 className="font-excon mb-2 text-xl font-bold">
            Prohibited Activities
          </h2>
          <ul className="font-satoshi list-disc pl-6 text-base">
            <li>Sharing copyrighted materials without authorization.</li>
            <li>Uploading malicious software or content.</li>
            <li>Using the platform for illegal or unethical purposes.</li>
          </ul>
        </section>
        <section className="rounded-xl border-2 border-black bg-zinc-100 p-6 shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373]">
          <h2 className="font-excon mb-2 text-xl font-bold">
            Payments and Subscriptions
          </h2>
          <p className="font-satoshi text-base">
            Notes Buddy offers free and paid subscription tiers. By subscribing
            to a paid plan, you agree to pay all associated fees. Subscription
            charges are non-refundable, except as required by applicable law.
          </p>
        </section>
        <section className="rounded-xl border-2 border-black bg-zinc-100 p-6 shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373]">
          <h2 className="font-excon mb-2 text-xl font-bold">
            Limitation of Liability
          </h2>
          <p className="font-satoshi text-base">
            Notes Buddy is not responsible for inaccuracies in user-contributed
            content or disruptions in service. Use the platform at your own
            risk.
          </p>
        </section>
        <section className="rounded-xl border-2 border-black bg-zinc-100 p-6 shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373]">
          <h2 className="font-excon mb-2 text-xl font-bold">
            Termination of Use
          </h2>
          <p className="font-satoshi text-base">
            We reserve the right to suspend or terminate your access if you
            violate these terms. Upon termination, your right to use the
            platform ceases immediately.
          </p>
        </section>
        <section className="rounded-xl border-2 border-black bg-zinc-100 p-6 shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373]">
          <h2 className="font-excon mb-2 text-xl font-bold">Governing Law</h2>
          <p className="font-satoshi text-base">
            These terms are governed by the laws of India. Any disputes will be
            resolved in the courts of Indore, Madhya Pradesh.
          </p>
        </section>
      </div>
    </section>
  );
}
