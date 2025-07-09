"use client";

import { signOut } from "@/lib/auth/auth-client";

export default function LogOutButton() {
  const handleSignOut = async (event: React.MouseEvent): Promise<void> => {
    event.preventDefault();

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
    <button
      data-umami-event="Logout button clicked"
      onClick={handleSignOut}
      className="font-excon cursor-pointer hover:underline"
      type="button"
    >
      Log Out
    </button>
  );
}
