/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useSession } from "@/lib/auth/auth-client";
import Script from "next/script";
import { useEffect } from "react";

export default function Umami() {
  const session = useSession();

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      (window as any).umami &&
      session.data?.user
    ) {
      (window as any).umami.identify({
        name: session.data.user.name,
        email: session.data.user.email,
        userId: session.data.user.id,
      });
    }
  }, [session.data?.user]);

  return (
    <Script
      defer
      src="/script.js"
      data-website-id={process.env.NEXT_PUBLIC_UMAMI_ID}
    />
  );
}
