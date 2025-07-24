import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | Notes Buddy",
  description:
    "Get in touch with Notes Buddy, share your feedback, or ask any questions.",
};

// Force static generation
export const dynamic = "force-static";

export default function ContactPage() {
  return (
    <section className="relative z-10 my-20 mt-10 flex flex-col items-center justify-center gap-8">
      <h1 className="font-excon mb-4 text-center text-4xl font-black tracking-tight text-black drop-shadow-[2px_2px_0px_rgba(0,0,0,0.8)] md:text-5xl dark:text-white">
        Contact Us
      </h1>
      <p className="font-satoshi mb-6 max-w-2xl text-center text-lg font-medium text-zinc-800 md:text-xl dark:text-zinc-200">
        Have a question, suggestion, or just want to say hi? <br />
        Reach out to us directly at:
      </p>
      <a
        href="mailto:notesbuddymu@gmail.com"
        className="font-excon rounded-lg border-2 border-black bg-zinc-100 px-8 py-4 text-2xl font-bold tracking-wider text-black shadow-[4px_4px_0px_0px_#000] transition-all duration-200 hover:bg-black hover:text-white dark:border-white dark:bg-zinc-900 dark:text-white dark:shadow-[4px_4px_0px_0px_#fff] dark:hover:bg-white dark:hover:text-black"
      >
        notesbuddymu@gmail.com
      </a>
    </section>
  );
}
