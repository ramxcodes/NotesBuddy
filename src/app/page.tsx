import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Notes Buddy",
  description: "Notes Buddy",
};

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-excon font-bold">Notes Buddy</h1>
      <p className="text-lg text-gray-500">Your notes, your way.</p>
      <Link className="mt-4" href="/sign-in">
        <Button data-umami-event="SignIn button on home page">
          Sign In with Google
        </Button>
      </Link>
    </div>
  );
}
