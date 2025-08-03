import React from "react";
import { Separator } from "../ui/separator";
import { Link } from "next-view-transitions";
import Image from "next/image";

const footerItems = [
  {
    label: "Contact Us",
    href: "/contact",
  },
  {
    label: "Shipping & Delivery",
    href: "/shipping",
  },
  {
    label: "Privacy Policy",
    href: "/privacy",
  },
  {
    label: "Cancellation & Refund Policy",
    href: "/refund",
  },
  {
    label: "Terms of Conditions",
    href: "/terms",
  },
];

export default function Footer() {
  return (
    <footer className="mt-10 mb-5 flex w-full flex-col items-center justify-center gap-6">
      <Separator className="w-full max-w-6xl" />
      <div className="container mx-4 flex max-w-4xl flex-row flex-wrap items-center justify-center gap-4 md:mx-2">
        {footerItems.map((item) => (
          <Link
            href={item.href}
            key={item.label}
            className="bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-full px-3 py-1 text-sm font-medium transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </div>
      <div className="text-muted-foreground text-sm">
        © 2024 Notes Buddy. All rights reserved.
      </div>
      <div className="font-excon relative text-5xl font-black tracking-tighter text-nowrap opacity-15 lg:text-9xl">
        <Image
          src="/doodles/superman.svg"
          width={200}
          height={50}
          alt="Notes Buddy"
          className="absolute -top-12 -right-14 size-16 md:-top-16 md:-right-22 md:size-28"
        />
        Notes Buddy
      </div>
      <div className="group flex items-center gap-2">
        <Image
          className="hidden size-12 rounded-2xl border border-gray-400 group-hover:border-2 md:block"
          src="/ram.png"
          width={48}
          height={48}
          alt="Ram"
        />
        <p className="opacity-50 transition-all duration-300 ease-in-out group-hover:opacity-100">
          <Link target="_blank" href="https://www.ramx.in">
            Build with ❤️{" "}
            <span className="transition-all duration-300 ease-in-out group-hover:underline">
              Ram
            </span>
          </Link>
        </p>
      </div>
    </footer>
  );
}
