"use client";

import { Button } from "@/components/ui/button";
import { ArrowClockwiseIcon } from "@phosphor-icons/react";
import { Link } from "next-view-transitions";

export default function FailedAuthPage() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-lg border p-6 text-center">
        <h1 className="text-foreground mb-2 text-2xl font-bold">
          Device Verification Failed
        </h1>
        <p className="text-muted-foreground mb-6">
          Please try the following and then sign in again:
        </p>
        <ul className="text-muted-foreground mx-auto mb-8 max-w-md list-disc space-y-2 pl-5 text-left">
          <li>Use Chrome browser</li>
          <li>Disable ad blockers temporarily</li>
          <li>Check your network connectivity</li>
          <li>Clear cookies and try again after a few minutes</li>
        </ul>
        <Button asChild>
          <Link href="/sign-in" className="group">
            <ArrowClockwiseIcon className="mr-2 h-4 w-4 transition-transform group-hover:rotate-180" />
            Try Again
          </Link>
        </Button>
      </div>
    </div>
  );
}
