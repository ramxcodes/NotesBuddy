"use client";

import { signOut } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LogOutButton() {
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
    <Link
      data-umami-event="Logout button clicked"
      href="/"
      onClick={handleSignOut}
      className="font-excon"
    >
      Log Out
    </Link>
  );
}
