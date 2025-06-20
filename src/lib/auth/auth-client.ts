import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();

export const { useSession } = authClient;

export const signIn = async () => {
  await authClient.signIn.social({
    provider: "google",
    callbackURL: "/profile",
    newUserCallbackURL: "/onboarding",
  });
};

export const signOut = async () => {
  return await authClient.signOut();
};

