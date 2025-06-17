/* eslint-disable @next/next/no-img-element */
import SignOutButton from "@/components/auth/sign-out-button";
import { getSession } from "@/lib/user";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Onboarding",
  description: "Onboarding page",
};

export default async function Onboarding() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="flex flex-col items-center gap-4 p-8">
        <img
          src={session?.user?.image || ""}
          alt={session.user.name || "User avatar"}
          className="w-24 h-24 rounded-full"
        />

        <div className="text-center">
          <h2 className="text-2xl font-bold">{session.user.name}</h2>
          <p className="text-gray-600">{session.user.email}</p>
          {session.user.emailVerified && (
            <span className="text-sm text-green-600">✓ Email verified</span>
          )}
        </div>

        <SignOutButton />
      </div>
    </div>
  );
}
