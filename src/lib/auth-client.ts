import { createAuthClient } from "better-auth/react";
import router from "next/router";
export const authClient = createAuthClient();

export const signIn = async () => {
  await authClient.signIn.social({
    provider: "google",
    callbackURL: "/profile",
    newUserCallbackURL: "/onboarding",
  });
};

export const signOut = async () => {
  await authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        router.push("/");
      },
    },
  });
};
