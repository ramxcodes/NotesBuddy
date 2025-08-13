"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { XCircleIcon } from "@phosphor-icons/react";
import Image from "next/image";
import { Button } from "../ui/button";

const BANNER_STORAGE_KEY = "crossable-banner-closed";

export default function CrossableBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const wasClosed = localStorage.getItem(BANNER_STORAGE_KEY);

    if (!wasClosed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsAnimating(false);
    localStorage.setItem(BANNER_STORAGE_KEY, "true");
    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed right-4 bottom-4 z-50 max-w-sm transform transition-all duration-300 ease-in-out ${
        isAnimating
          ? "translate-x-0 scale-100 opacity-100"
          : "translate-x-full scale-95 opacity-0"
      }`}
    >
      <div className="relative overflow-hidden rounded-xl border-2 border-black bg-white p-5 shadow-[8px_8px_0px_0px_#000] backdrop-blur-sm dark:border-white/20 dark:bg-zinc-800 dark:shadow-[8px_8px_0px_0px_#757373]">
        {/* Close button */}
        <Button
          onClick={handleClose}
          className="absolute top-2 right-2 h-8 w-8 rounded-full border-2 border-black p-1 hover:cursor-pointer"
          variant="ghost"
          aria-label="Close banner"
        >
          <XCircleIcon weight="duotone" className="h-5 w-5" />
        </Button>

        {/* Banner content */}
        <div className="relative z-10 pr-3">
          <h3 className="font-excon flex items-center gap-2.5 text-lg leading-tight font-bold">
            <Image
              className="inline-block"
              src="/evil.png"
              alt="EvilCharts"
              width={20}
              height={20}
            />
            Check out EvilCharts!
          </h3>
          <p className="mt-3 text-sm leading-relaxed opacity-90">
            Beautiful & Animated Charts for your next project. Interactive
            charts built for developers.
          </p>
          <div className="mt-4 flex gap-2.5">
            <Link
              href="https://evilcharts.com?ref=notesbuddy"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border-2 border-black px-4 py-2 text-xs font-bold shadow-[3px_3px_0px_0px_#000] transition-all duration-200 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#000] focus:ring-2 focus:ring-black focus:ring-offset-2 focus:outline-none dark:border-white/20 dark:shadow-[3px_3px_0px_0px_#fff] dark:hover:shadow-[2px_2px_0px_0px_#fff] dark:focus:ring-white"
            >
              Check it out!
            </Link>
            <Link
              href="https://github.com/legions-developer/evilcharts"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border-2 border-black bg-white px-4 py-2 text-xs font-bold shadow-[3px_3px_0px_0px_#000] transition-all duration-200 hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-black hover:text-white hover:shadow-[2px_2px_0px_0px_#000] focus:ring-2 focus:ring-black focus:ring-offset-2 focus:outline-none dark:border-white/20 dark:bg-black dark:text-white dark:shadow-[3px_3px_0px_0px_#fff] dark:hover:bg-white dark:hover:text-black dark:hover:shadow-[2px_2px_0px_0px_#fff] dark:focus:ring-white"
            >
              Star Github
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
