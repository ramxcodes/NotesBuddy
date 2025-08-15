"use client";
import Link from "next/link";
import React from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function PromoBanner() {
  const hiddenPaths = ["/sign-in", "/onboarding", "/premium", "/profile"];

  const currentPath = usePathname();
  const isHidden =
    hiddenPaths.includes(currentPath) ||
    currentPath.startsWith("/notes/") ||
    currentPath.startsWith("/admin");

  if (isHidden) return null;

  return (
    <div className="sticky top-0 z-30 border-2 border-r-0 border-b-0 border-l-0 border-black bg-yellow-400 px-4 py-3 text-center text-black shadow-[4px_4px_0px_0px_#000] dark:bg-yellow-300 dark:shadow-[4px_4px_0px_0px_#fff]">
      {/* Mobile version - visible only on small screens */}
      <Link
        href="https://evilcharts.com?ref=notesbuddy"
        target="_blank"
        className="block md:hidden"
      >
        <p className="font-excon cursor-pointer text-sm underline underline-offset-2">
          <Image
            className="inline-block"
            src="/evil.png"
            alt="EvilCharts"
            width={20}
            height={20}
          />
          <b className="ml-1 font-mono">
            Evil Charts - Beautiful & Animated Charts
          </b>
        </p>
      </Link>

      {/* Desktop version - visible only on medium screens and up */}
      <p className="font-excon hidden text-sm md:block">
        <Image
          className="inline-block"
          src="/evil.png"
          alt="EvilCharts"
          width={20}
          height={20}
        />
        <b className="ml-1 font-mono">
          Evil Charts - Beautiful & Animated Charts
        </b>{" "}
        <Link
          href="https://evilcharts.com?ref=notesbuddy"
          target="_blank"
          className="w-fit rounded border-2 border-black bg-white px-2 py-1 font-black shadow-[2px_2px_0px_0px_#000] hover:bg-black hover:text-white dark:bg-black dark:text-white dark:shadow-[2px_2px_0px_0px_#000]"
        >
          Check it out!
        </Link>
      </p>
    </div>
  );
}
