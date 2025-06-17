"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth-client";

export function SignInButton() {
  return (
    <Button variant="default" onClick={signIn}>
      Sign In
    </Button>
  );
}