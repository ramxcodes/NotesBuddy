"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Link } from "next-view-transitions";
import {
  HouseIcon,
  MagnifyingGlassIcon,
  BookOpenIcon,
  ArrowCounterClockwiseIcon,
} from "@phosphor-icons/react";
import Science from "@/components/svgs/Science";
import Cap from "@/components/svgs/Cap";
import HandDrawnArrow from "@/components/svgs/HandDrawnArrow";

export default function NotFound() {
  return (
    <div className="bg-background relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          animate={{
            rotate: [0, 15, -10, 5, 0],
            scale: [1, 1.05, 0.95, 1.02, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 left-10 opacity-20"
        >
          <Science className="h-16 w-16" />
        </motion.div>

        <motion.div
          animate={{
            rotate: [0, -20, 15, -8, 0],
            scale: [1, 0.9, 1.1, 0.95, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute top-32 right-16 opacity-20"
        >
          <Cap className="h-20 w-20" />
        </motion.div>

        <motion.div
          animate={{
            rotate: [0, 30, -25, 12, 0],
            scale: [1, 1.15, 0.85, 1.05, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
          className="absolute bottom-20 left-20 opacity-20"
        >
          <Science className="h-12 w-12" />
        </motion.div>

        <motion.div
          animate={{
            rotate: [0, -45, 35, -18, 0],
            scale: [1, 0.8, 1.2, 0.9, 1],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute right-12 bottom-32 opacity-20"
        >
          <Cap className="h-14 w-14" />
        </motion.div>

        {/* Floating geometric shapes */}
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-1/4 left-1/4 opacity-5"
        >
          <div className="border-foreground h-32 w-32 rounded-full border-4"></div>
        </motion.div>

        <motion.div
          animate={{
            rotate: [360, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute right-1/4 bottom-1/4 opacity-5"
        >
          <div className="border-foreground h-24 w-24 rotate-45 transform border-4"></div>
        </motion.div>
      </div>

      <div className="relative z-10 mx-auto max-w-2xl space-y-8 text-center">
        {/* Main 404 Number */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotateY: 180 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative"
        >
          <div className="neuro-xl inline-block -rotate-2 transform p-8 transition-all duration-500 hover:scale-105 hover:rotate-0">
            <h1 className="font-excon text-foreground text-8xl font-black md:text-9xl">
              404
            </h1>
          </div>

          {/* Arrow pointing to 404 */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.6, scale: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="absolute -top-12 -right-16 hidden md:block"
          >
            <HandDrawnArrow className="h-24 w-24 rotate-45" />
          </motion.div>
        </motion.div>

        {/* Error Message */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="neuro rotate-1 transform p-6 transition-all duration-500 hover:rotate-0 hover:shadow-[6px_6px_0px_0px_#000] dark:hover:shadow-[6px_6px_0px_0px_#757373]"
        >
          <h2 className="font-ranade text-foreground mb-2 text-2xl font-black md:text-3xl">
            Oops! Page Not Found
          </h2>
          <p className="text-muted-foreground font-satoshi text-lg leading-relaxed">
            The page you&apos;re looking for seems to have vanished into the
            void. Don&apos;t worry, even the best notes sometimes get misplaced!
          </p>
        </motion.div>

        {/* Fun Facts Box */}
        <motion.div
          initial={{ x: -50, opacity: 0, rotate: -5 }}
          animate={{ x: 0, opacity: 1, rotate: -1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="neuro-info transform p-4 transition-all duration-500 hover:rotate-0"
        >
          <div className="mb-3 flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <MagnifyingGlassIcon
                size={20}
                className="text-blue-600 dark:text-blue-400"
              />
            </motion.div>
            <span className="font-satoshi text-sm font-bold text-blue-800 dark:text-blue-300">
              Did you know?
            </span>
          </div>
          <p className="font-satoshi text-sm text-blue-700 dark:text-blue-300">
            HTTP 404 errors were named after room 404 at CERN, where the
            original web server was located!
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link href="/" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="neuro-button bg-foreground text-background hover:bg-foreground/90 font-satoshi w-full font-bold transition-all duration-300 hover:scale-105 sm:w-auto"
            >
              <HouseIcon size={20} />
              Back to Home
            </Button>
          </Link>

          <Link href="/notes" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="neuro bg-background border-foreground hover:bg-accent font-satoshi w-full border-2 font-bold transition-all duration-300 hover:scale-105 sm:w-auto"
            >
              <BookOpenIcon size={20} />
              Browse Notes
            </Button>
          </Link>
        </motion.div>

        {/* Search Suggestion */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="neuro-sm bg-muted/50 border-muted-foreground/20 transform p-4 transition-all duration-300 hover:scale-[1.02]"
        >
          <p className="text-muted-foreground font-satoshi text-sm">
            Try searching for what you were looking for, or explore our{" "}
            <Link
              href="/notes"
              className="text-foreground font-bold underline-offset-4 transition-all duration-200 hover:underline"
            >
              notes collection
            </Link>{" "}
            instead.
          </p>
        </motion.div>

        {/* Go Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.5 }}
          className="pt-4"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            className="text-muted-foreground hover:text-foreground font-satoshi transition-all duration-300"
          >
            <ArrowCounterClockwiseIcon size={16} />
            Go Back
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
