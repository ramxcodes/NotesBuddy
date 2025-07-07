import { SignInButton } from "@/components/auth/SignInButton";
import { auth } from "@/lib/auth/auth";
import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in page",
};

export default async function SignIn() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/onboarding");
  }

  return (
    <div>
      <SignInButton />
    </div>
  );
}
