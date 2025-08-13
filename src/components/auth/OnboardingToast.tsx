"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface OnboardingToastProps {
  isAuthenticated: boolean;
  isOnboarded: boolean;
}

export default function OnboardingToast({
  isAuthenticated,
  isOnboarded,
}: OnboardingToastProps) {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && !isOnboarded) {
      let countdown = 5;
      const toastId = toast("Please complete your profile.", {
        description: `Redirecting you in ${countdown} seconds`,
        duration: 5000,
        action: {
          label: "Go now",
          onClick: () => {
            router.push("/onboarding");
          },
        },
      });

      const interval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
          toast("Please complete your profile.", {
            id: toastId,
            description: `Redirecting you in ${countdown} seconds`,
            duration: countdown * 1000,
            action: {
              label: "Go now",
              onClick: () => {
                router.push("/onboarding");
              },
            },
          });
        } else {
          clearInterval(interval);
          router.push("/onboarding");
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, isOnboarded, router]);

  return null; // This component doesn't render anything visible
}
