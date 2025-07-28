"use client";

import { signOut } from "@/lib/auth/auth-client";

export default function LogOutButton() {
  const handleSignOut = async (event: React.MouseEvent): Promise<void> => {
    event.preventDefault();
    try {
      await signOut();
    } catch {
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
  };

  return (
    <button
      data-umami-event="auth-logout-button-click"
      onClick={handleSignOut}
      className="font-excon cursor-pointer text-red-500"
      type="button"
    >
      Log Out
    </button>
  );
}
