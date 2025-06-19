"use client";

import { signOut } from "@/lib/auth/auth-client";
import { Button } from "../ui/button";

export default function SignOutButton() {
  return (
    <Button variant={"destructive"} onClick={signOut}>
      Sign Out
    </Button>
  );
}
