"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Link } from "next-view-transitions";
import {
  ShieldWarningIcon,
  HouseIcon,
  DevicesIcon,
  WarningIcon,
  ArrowClockwiseIcon,
} from "@phosphor-icons/react";
import Science from "@/components/svgs/Science";
import Cap from "@/components/svgs/Cap";
import HandDrawnArrow from "@/components/svgs/HandDrawnArrow";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { signOut } from "@/lib/auth/auth-client";

function AuthErrorContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    signOut();
  }, []);

  const errorCode = searchParams.get("error") || "UNKNOWN_ERROR";
  const errorMessage =
    searchParams.get("message") || "An unexpected error occurred.";

  const getErrorDetails = () => {
    switch (errorCode) {
      case "DEVICE_VERIFICATION_FAILED_PLEASE_TRY_AGAIN_OR_CONTACT_SUPPORT_IF_THIS_PERSISTS":
        return {
          title: "Device Verification Failed",
          description:
            "We couldn't verify your device. This could be due to device limits or security restrictions.",
          icon: <ShieldWarningIcon className="h-16 w-16" />,
          suggestions: [
            "You may have reached the maximum number of devices (2) for your account",
            "Try signing in from a previously registered device",
            "Contact support if you need to register a new device",
            "Clear your browser data and try again",
          ],
        };
      case "DEVICE_LIMIT_EXCEEDED":
        return {
          title: "Device Limit Reached",
          description:
            "You've reached the maximum number of devices allowed for your account.",
          icon: <DevicesIcon className="h-16 w-16" />,
          suggestions: [
            "Maximum of 2 devices are allowed per account",
            "Sign in from a previously registered device",
            "Contact support for assistance",
          ],
        };
      case "ACCOUNT_SUSPENDED":
        return {
          title: "Account Suspended",
          description:
            "Your account has been suspended due to security violations.",
          icon: <ShieldWarningIcon className="h-16 w-16" />,
          suggestions: [
            "Contact support to appeal the suspension",
            "Review our terms of service",
            "Provide additional verification if requested",
            "Wait for the suspension period to end",
          ],
        };
      default:
        return {
          title: "Authentication Error",
          description: errorMessage,
          icon: <WarningIcon className="h-16 w-16" />,
          suggestions: [
            "Try refreshing the page",
            "Clear your browser cache and cookies",
            "Try signing in again",
            "Contact support if the problem persists",
          ],
        };
    }
  };

  const errorDetails = getErrorDetails();

  return (
    <div className="bg-background relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          animate={{
            rotate: [0, 20, -15, 8, 0],
            scale: [1, 1.1, 0.9, 1.05, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 left-10 opacity-15"
        >
          <Science className="h-16 w-16" />
        </motion.div>

        <motion.div
          animate={{
            rotate: [0, -25, 15, -10, 0],
            scale: [1, 0.9, 1.1, 0.95, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute top-40 right-20 opacity-10"
        >
          <Cap className="h-20 w-20" />
        </motion.div>

        <motion.div
          animate={{
            rotate: [0, 15, -20, 12, 0],
            x: [0, 10, -10, 5, 0],
            y: [0, -5, 5, -3, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
          className="absolute bottom-32 left-20 opacity-10"
        >
          <HandDrawnArrow className="h-12 w-12" />
        </motion.div>
      </div>

      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="text-destructive mb-6 inline-flex justify-center"
          >
            {errorDetails.icon}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-foreground text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
          >
            {errorDetails.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-muted-foreground mx-auto mt-6 max-w-3xl text-xl leading-relaxed"
          >
            {errorDetails.description}
          </motion.p>
        </motion.div>

        {/* Error suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mb-8 text-left"
        >
          <h3 className="text-foreground mb-4 text-lg font-semibold">
            What you can try:
          </h3>
          <ul className="text-muted-foreground space-y-2">
            {errorDetails.suggestions.map((suggestion, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.3 }}
                className="flex items-start gap-3"
              >
                <div className="bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full" />
                <span>{suggestion}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button asChild className="group min-w-[140px]">
            <Link href="/sign-in">
              <ArrowClockwiseIcon className="mr-2 h-4 w-4 transition-transform group-hover:rotate-180" />
              Try Again
            </Link>
          </Button>

          <Button asChild variant="outline" className="group min-w-[140px]">
            <Link href="/">
              <HouseIcon className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
              Go Home
            </Link>
          </Button>
        </motion.div>

        {/* Debug info (only in development) */}
        {process.env.NODE_ENV === "development" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="bg-muted/50 mt-8 rounded-lg p-4 text-left"
          >
            <h4 className="text-foreground mb-2 text-sm font-semibold">
              Debug Information:
            </h4>
            <div className="text-muted-foreground space-y-1 text-xs">
              <div>
                <strong>Error Code:</strong> {errorCode}
              </div>
              <div>
                <strong>Message:</strong> {errorMessage}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense
      fallback={
        <div className="bg-background relative flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="border-primary mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-t-transparent"></div>
            <p className="text-muted-foreground">Loading error details...</p>
          </div>
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
