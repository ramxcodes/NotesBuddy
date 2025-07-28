"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  ArrowCounterClockwiseIcon,
  HouseIcon,
  WarningCircleIcon,
  BugIcon,
  ArrowClockwiseIcon,
} from "@phosphor-icons/react";
import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global error caught:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="bg-background relative flex min-h-screen items-center justify-center overflow-hidden p-4">
          {/* Background decorative elements */}
          <div className="pointer-events-none absolute inset-0">
            {/* Floating geometric shapes */}
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.15, 1],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute top-1/4 left-1/4 opacity-5"
            >
              <div className="h-32 w-32 rounded-full border-4 border-black dark:border-white"></div>
            </motion.div>

            <motion.div
              animate={{
                rotate: [360, 0],
                scale: [1, 0.85, 1],
              }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute right-1/4 bottom-1/4 opacity-5"
            >
              <div className="h-24 w-24 rotate-45 transform border-4 border-black dark:border-white"></div>
            </motion.div>
          </div>

          <div className="relative z-10 mx-auto max-w-2xl space-y-8 text-center">
            {/* Main Error Icon/Number */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative"
            >
              <div className="neuro-xl inline-block transform p-8 transition-all duration-500 hover:scale-105 hover:rotate-0">
                <div className="flex items-center justify-center text-6xl font-black text-black md:text-7xl dark:text-white">
                  <WarningCircleIcon size={80} className="mr-4 text-red-600" />
                  <span>Error</span>
                </div>
              </div>
            </motion.div>

            {/* Error Message */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="neuro transform p-6 transition-all duration-500 hover:rotate-0"
            >
              <h2 className="mb-2 text-2xl font-black text-black md:text-3xl dark:text-white">
                Critical Error Occurred
              </h2>
              <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-400">
                Something went seriously wrong. Please try refreshing the page
                or contact support if the problem persists.
              </p>
            </motion.div>

            {/* Error Details (in development) */}
            {process.env.NODE_ENV === "development" && (
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="neuro-danger transform p-4 transition-all duration-500"
              >
                <div className="mb-3 flex items-center gap-3">
                  <BugIcon size={20} className="text-red-600" />
                  <span className="text-sm font-bold text-red-800 dark:text-red-300">
                    Global Error Details
                  </span>
                </div>
                <p className="text-left font-mono text-sm text-red-700 dark:text-red-300">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                    Error ID: {error.digest}
                  </p>
                )}
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Button
                onClick={reset}
                size="lg"
                className="neuro-button w-full bg-black font-bold text-white transition-all duration-300 hover:scale-105 hover:bg-black/90 sm:w-auto dark:bg-white dark:text-black"
              >
                <ArrowClockwiseIcon size={20} />
                Reload Page
              </Button>

              <Button
                onClick={() => (window.location.href = "/")}
                variant="outline"
                size="lg"
                className="neuro w-full border-2 border-black bg-white font-bold transition-all duration-300 hover:scale-105 hover:bg-gray-100 sm:w-auto dark:border-white dark:bg-gray-800"
              >
                <HouseIcon size={20} />
                Go Home
              </Button>
            </motion.div>

            {/* Go Back Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="pt-4"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="text-gray-600 transition-all duration-300 hover:text-black dark:text-gray-400 dark:hover:text-white"
              >
                <ArrowCounterClockwiseIcon size={16} />
                Go Back
              </Button>
            </motion.div>
          </div>
        </div>
      </body>
    </html>
  );
}
