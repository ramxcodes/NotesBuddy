import { createAuthClient } from "better-auth/react";
import { deviceFingerprintingClientPlugin } from "./plugins/device-fingerprinting-client";

export const authClient = createAuthClient({
  plugins: [deviceFingerprintingClientPlugin()],
});

export const { useSession } = authClient;

const clearDeviceFingerprintData = (userId?: string) => {
  if (typeof window === "undefined") return;

  try {
    const STORAGE_KEY_PREFIX = "device-fingerprint-";

    if (userId) {
      // Clear specific user's data
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}${userId}-registered`);
      localStorage.removeItem(
        `${STORAGE_KEY_PREFIX}${userId}-unrecoverable-error`,
      );
    } else {
      // Clear all device fingerprint data (fallback)
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(STORAGE_KEY_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    }
  } catch (error) {
    console.warn("Failed to clear device fingerprint data:", error);
  }
};

export const signIn = async (): Promise<void> => {
  await authClient.signIn.social({
    provider: "google",
    callbackURL: "/profile",
    newUserCallbackURL: "/onboarding",
  });
};

export const signOut = async (): Promise<void> => {
  try {
    // Get current user ID before signing out
    const { data: session } = await authClient.getSession();
    const userId = session?.user?.id;

    clearDeviceFingerprintData(userId);

    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          if (typeof window !== "undefined") {
            window.location.href = "/";
          }
        },
      },
    });
  } catch (error) {
    console.error("Sign out failed:", error);
    clearDeviceFingerprintData();
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  }
};
