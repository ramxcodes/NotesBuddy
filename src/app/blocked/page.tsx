import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { APP_CONFIG } from "@/utils/config";

export const metadata: Metadata = {
  title: "Account Blocked",
  description: "Your account has been blocked",
};

export default function BlockedPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen p-8">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold text-red-600 mb-4">
          Account Blocked
        </h1>
        <p className="text-gray-600 mb-6">
          Your account has been blocked due to too many active devices. For
          security reasons, we limit accounts to{" "}
          {APP_CONFIG.MAX_DEVICES_PER_USER} active devices.
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Please contact support if you believe this is an error or if you need
          to manage your active devices.
        </p>
        <Link href="/sign-in">
          <Button>Try Again</Button>
        </Link>
      </div>
    </div>
  );
}
