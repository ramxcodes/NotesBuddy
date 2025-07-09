"use client";

import { signOut } from "@/lib/auth/auth-client";
import { Button } from "../ui/button";

export default function SignOutButton() {
  const handleSignOut = async (): Promise<void> => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out failed:", error);
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
  };

  return (
    <Button
      data-umami-event="SignOut button"
      variant={"destructive"}
      onClick={handleSignOut}
      className="font-excon"
    >
      Sign Out
    </Button>
  );
}
