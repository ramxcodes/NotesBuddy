"use client";

import { signIn } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";
import { GoogleLogoIcon } from "@phosphor-icons/react";
import { Link } from "next-view-transitions";
import { useSession } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SignIn() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      router.push("/profile");
    }
  }, [session, router]);

  if (session?.user) {
    return null; // Prevent flash while redirecting
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Header Section */}
          <div className="mb-8 text-center">
            <h1 className="font-excon mb-4 text-4xl font-black text-black sm:text-5xl dark:text-white">
              Welcome!
            </h1>
            <p className="font-satoshi text-lg font-bold text-black/70 dark:text-white/70">
              Sign in & Sign up to access content!
            </p>
          </div>

          {/* Main Sign In Card */}
          <div className="neuro-xl rounded-2xl p-8">
            <div className="space-y-6">
              {/* Benefits Section */}
              <div className="space-y-4">
                <h2 className="font-excon text-xl font-black text-black dark:text-white">
                  What you&apos;ll get access to:
                </h2>

                <div className="space-y-3">
                  <div className="neuro-sm flex items-center gap-3 rounded-lg p-3">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="font-satoshi text-sm font-bold text-black dark:text-white">
                      Free Notes
                    </span>
                  </div>

                  <div className="neuro-sm flex items-center gap-3 rounded-lg p-3">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <span className="font-satoshi text-sm font-bold text-black dark:text-white">
                      AI-powered chatbot
                    </span>
                  </div>

                  <div className="neuro-sm flex items-center gap-3 rounded-lg p-3">
                    <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                    <span className="font-satoshi text-sm font-bold text-black dark:text-white">
                      Quizzes, PYQ, Flashcard & more
                    </span>
                  </div>

                  <div className="neuro-sm flex items-center gap-3 rounded-lg p-3">
                    <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                    <span className="font-satoshi text-sm font-bold text-black dark:text-white">
                      Purchase premium study resources
                    </span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-black/20 dark:border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="font-satoshi bg-white px-4 font-bold text-black/60 dark:bg-zinc-900 dark:text-white/60">
                    Ready to get started?
                  </span>
                </div>
              </div>

              {/* Sign In Button */}
              <Button
                onClick={signIn}
                className="neuro-button font-satoshi flex w-full items-center justify-center gap-3 py-4 text-lg font-bold transition-all"
                data-umami-event="sign-in-google"
              >
                <GoogleLogoIcon weight="duotone" className="h-6 w-6" />
                Sign in with Google
              </Button>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-8 text-center">
            <p className="font-satoshi text-sm font-bold text-black/60 dark:text-white/60">
              By signing in, you agree to our{" "}
              <Link
                href="/terms"
                className="font-black text-black underline decoration-2 underline-offset-2 hover:decoration-4 dark:text-white"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="font-black text-black underline decoration-2 underline-offset-2 hover:decoration-4 dark:text-white"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
