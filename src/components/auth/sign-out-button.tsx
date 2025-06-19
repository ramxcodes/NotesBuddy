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
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <Button variant={"destructive"} onClick={handleSignOut}>
      Sign Out
    </Button>
  );
}
