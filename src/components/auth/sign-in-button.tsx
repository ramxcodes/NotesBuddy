"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth/auth-client";

export function SignInButton() {
  return (
    <Button data-umami-event="SignIn button" variant="default" onClick={signIn}>
      Sign In
    </Button>
  );
}
