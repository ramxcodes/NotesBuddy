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
import { Link } from "next-view-transitions";
import { GoogleLogoIcon } from "@phosphor-icons/react";

export function SignInButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:hover:shadow-[3px_3px_0px_0px_#757373]"
        >
          Sign In
        </Button>
      </DialogTrigger>
      <DialogContent className="space-y-6 border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#757373]">
        <DialogHeader>
          <DialogTitle className="font-excon text-2xl font-black text-black dark:text-white">
            Sign In
          </DialogTitle>
          <DialogDescription className="space-y-4">
            <span className="font-satoshi font-bold text-black dark:text-white">
              One step closer to your notes
            </span>
            <Button
              onClick={signIn}
              variant="outline"
              className="mt-4 flex w-full items-center justify-center gap-2 border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:hover:shadow-[3px_3px_0px_0px_#757373]"
            >
              <GoogleLogoIcon weight="duotone" className="h-5 w-5" />
              Sign in with Google
            </Button>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-2">
          <span className="font-satoshi text-xs font-bold text-black dark:text-white">
            By signing in, you agree to our{" "}
            <DialogTrigger asChild>
              <Link
                href="/terms"
                className="font-black underline decoration-2 underline-offset-2"
              >
                Terms of Service
              </Link>
            </DialogTrigger>
            .
          </span>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
