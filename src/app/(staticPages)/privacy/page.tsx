import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy | Notes Buddy",
  description:
    "Learn about how we collect, use, and protect your personal information.",
};

export default function PrivacyPage() {
  return (
    <section className="relative z-10 my-20 mt-10 flex flex-col items-center justify-center gap-8">
      <h1 className="font-excon mb-2 text-center text-4xl font-black tracking-tight text-black drop-shadow-[2px_2px_0px_rgba(0,0,0,0.8)] md:text-5xl dark:text-white">
        Privacy Policy
      </h1>
      <p className="font-satoshi mb-2 text-center text-base text-zinc-600 dark:text-zinc-300">
        Last updated: Jan 18, 2025
      </p>
      <div className="flex w-full max-w-2xl flex-col gap-8">
        <section className="rounded-xl border-2 border-black bg-zinc-100 p-6 shadow-[4px_4px_0px_0px_#000] dark:border-white dark:bg-zinc-900 dark:text-white dark:shadow-[4px_4px_0px_0px_#fff]">
          <h2 className="font-excon mb-2 text-2xl font-bold">
            Privacy Policy for Notes Buddy
          </h2>
          <p className="font-satoshi text-base">
            Welcome to Notes Buddy. If you have any questions or concerns about
            our policy or our practices regarding your personal information,
            please contact us.
          </p>
        </section>
        <section className="rounded-xl border-2 border-black bg-zinc-100 p-6 shadow-[4px_4px_0px_0px_#000] dark:border-white dark:bg-zinc-900 dark:text-white dark:shadow-[4px_4px_0px_0px_#fff]">
          <h2 className="font-excon mb-2 text-xl font-bold">
            Information We Collect and How We Use It
          </h2>
          <ul className="font-satoshi mb-2 list-disc pl-6 text-base">
            <li>Names</li>
            <li>Email addresses</li>
            <li>Phone Number</li>
            <li>University</li>
            <li>Degree</li>
          </ul>
          <p className="font-satoshi text-base">
            We collect personal information through forms and analytics tools to
            provide services, enhance user experience, and improve our marketing
            efforts.
          </p>
        </section>
        <section className="rounded-xl border-2 border-black bg-zinc-100 p-6 shadow-[4px_4px_0px_0px_#000] dark:border-white dark:bg-zinc-900 dark:text-white dark:shadow-[4px_4px_0px_0px_#fff]">
          <h2 className="font-excon mb-2 text-xl font-bold">
            Use of Your Information
          </h2>
          <ul className="font-satoshi list-disc pl-6 text-base">
            <li>Provide and maintain our services</li>
            <li>Improve and expand our website</li>
            <li>Understand and analyze how you use our website</li>
            <li>Enhance our marketing and promotional efforts</li>
          </ul>
        </section>
        <section className="rounded-xl border-2 border-black bg-zinc-100 p-6 shadow-[4px_4px_0px_0px_#000] dark:border-white dark:bg-zinc-900 dark:text-white dark:shadow-[4px_4px_0px_0px_#fff]">
          <h2 className="font-excon mb-2 text-xl font-bold">
            Disclosure of Your Information
          </h2>
          <p className="font-satoshi text-base">
            We do not share your personal information with third parties. All
            personal information is kept confidential within our organization.
          </p>
        </section>
        <section className="rounded-xl border-2 border-black bg-zinc-100 p-6 shadow-[4px_4px_0px_0px_#000] dark:border-white dark:bg-zinc-900 dark:text-white dark:shadow-[4px_4px_0px_0px_#fff]">
          <h2 className="font-excon mb-2 text-xl font-bold">
            Security of Your Information
          </h2>
          <p className="font-satoshi text-base">
            We use encryption to secure your personal information against
            unauthorized access, use, or disclosure.
          </p>
        </section>
        <section className="rounded-xl border-2 border-black bg-zinc-100 p-6 shadow-[4px_4px_0px_0px_#000] dark:border-white dark:bg-zinc-900 dark:text-white dark:shadow-[4px_4px_0px_0px_#fff]">
          <h2 className="font-excon mb-2 text-xl font-bold">Contact Us</h2>
          <p className="font-satoshi text-base">
            If you have questions or concerns about this privacy policy, please
            feel free to contact us.
          </p>
        </section>
      </div>
    </section>
  );
}
