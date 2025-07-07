"use client";

import { signOut } from "@/lib/auth/auth-client";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
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
      variant={"destructive"}
      onClick={handleSignOut}
      className="font-excon"
    >
      Sign Out
    </Button>
  );
}
