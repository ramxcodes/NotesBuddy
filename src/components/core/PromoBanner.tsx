import Link from "next/link";
import React from "react";
import Image from "next/image";

export default function PromoBanner() {
  return (
    <div className="sticky top-0 z-30 border-2 border-black bg-yellow-400 px-4 py-3 text-center text-black shadow-[4px_4px_0px_0px_#000] dark:bg-yellow-300 dark:shadow-[4px_4px_0px_0px_#fff]">
      <p className="font-excon text-sm">
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
          className="rounded border-2 border-black bg-white px-2 py-1 font-black shadow-[2px_2px_0px_0px_#000] hover:bg-black hover:text-white dark:bg-black dark:text-white dark:shadow-[2px_2px_0px_0px_#000]"
        >
          Check it out!
        </Link>
      </p>
    </div>
  );
}
