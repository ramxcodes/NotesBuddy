"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth/auth-client";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import Link from "next/link";
import { GoogleLogoIcon } from "@phosphor-icons/react";

export function SignInButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="font-ranade font-regular rounded-full"
        >
          Sign In
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-opacity-10 space-y-4 border-none bg-clip-padding text-white backdrop-blur backdrop-contrast-100 backdrop-saturate-100 backdrop-filter">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Sign In</DialogTitle>
          <DialogDescription className="space-y-4">
            <span className="text-sm text-gray-300">
              One step closer to your notes
            </span>
            <Button
              onClick={signIn}
              variant="outline"
              className="flex w-full items-center justify-center gap-2 bg-white text-black hover:cursor-pointer hover:bg-white/90 dark:bg-white dark:text-black dark:hover:bg-white/90 dark:hover:text-black mt-2"
            >
              <GoogleLogoIcon type="duotone" className="size-6" size={20} />
              Sign in with google
            </Button>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-2">
          <span className="text-xs">
            By signing in, you agree to our{" "}
            <Link href="/terms">Terms of Service</Link>.
          </span>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
