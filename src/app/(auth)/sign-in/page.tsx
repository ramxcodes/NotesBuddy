import { SignInButton } from "@/components/auth/SignInButton";
import { auth } from "@/lib/auth/auth";
import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sign In - Access Your Study Dashboard",
  description:
    "Sign in to your Notes Buddy account to access personalized study notes, AI-powered learning tools, and track your academic progress.",
  robots: {
    index: false,
    follow: true,
    nocache: true,
  },
};

export default async function SignIn() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/profile");
  }

  return (
    <div>
      <SignInButton />
    </div>
  );
}
