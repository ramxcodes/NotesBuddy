"use client";

import React from "react";
import { Button } from "../ui/button";
import { signOut } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";

export default function BlockedSignOutButton() {
  const router = useRouter();
  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch {
      router.push("/");
    }
  };

  return (
    <Button
      data-umami-event="SignOut button"
      onClick={handleSignOut}
      className="border-2 border-black bg-zinc-100 px-6 py-3 font-black text-black shadow-[4px_4px_0px_0px_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none dark:border-white/20 dark:bg-zinc-700 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373]"
    >
      Try Again
    </Button>
  );
}
