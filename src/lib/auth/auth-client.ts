import { createAuthClient } from "better-auth/react";
import { deviceFingerprintingClientPlugin } from "./plugins/device-fingerprinting-client";

export const authClient = createAuthClient({
  plugins: [deviceFingerprintingClientPlugin()],
});

export const { useSession } = authClient;

export const signIn = async (): Promise<void> => {
  await authClient.signIn.social({
    provider: "google",
    callbackURL: "/profile",
    newUserCallbackURL: "/onboarding",
  });
};

export const signOut = async (): Promise<void> => {
  await authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        if (typeof window !== "undefined") {
          window.location.href = "/";
        }
      },
    },
  });
};
