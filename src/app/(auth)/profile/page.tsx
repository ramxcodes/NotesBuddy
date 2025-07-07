/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import SignOutButton from "@/components/auth/SignOutButton";
import { DeviceFingerprint } from "@/components/auth/DeviceFingerprint";
import { Button } from "@/components/ui/button";
import {
  getUserFullProfile,
  getUserOnboardingStatus,
} from "@/dal/user/onboarding/query";
import { getUserDevices } from "@/dal/user/device/query";
import { getSession, checkUserBlockedStatus } from "@/lib/db/user";
import { getDisplayName } from "@/lib/user/helper";
import {
  DEGREE_OPTIONS,
  SEMESTER_OPTIONS,
  UNIVERSITY_OPTIONS,
  YEAR_OPTIONS,
} from "@/utils/constant";
import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Profile",
  description: "Profile page",
};

export default async function Profile() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  // Check if user is blocked
  const isBlocked = await checkUserBlockedStatus(session.user.id);
  if (isBlocked) {
    redirect("/blocked");
  }

  const isOnboarded = await getUserOnboardingStatus(session?.user?.id || "");
  const profile = await getUserFullProfile(session?.user?.id || "");
  const devices = await getUserDevices(session?.user?.id || "");
  const university = getDisplayName(
    profile?.university || "",
    UNIVERSITY_OPTIONS
  );
  const degree = getDisplayName(profile?.degree || "", DEGREE_OPTIONS);
  const year = getDisplayName(profile?.year || "", YEAR_OPTIONS);
  const semester = getDisplayName(profile?.semester || "", SEMESTER_OPTIONS);

  return (
    <>
      <DeviceFingerprint />
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

        {!isOnboarded.isOnboarded ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold">Profile</h2>
            <p className="text-gray-600">
              Please complete your profile to continue
            </p>
            <Link href="/onboarding">
              <Button>Complete Profile</Button>
            </Link>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-bold">Profile</h2>
            <p className="text-gray-600">Your profile is complete</p>
            <p className="text-gray-600">
              {profile?.firstName} {profile?.lastName}
            </p>
            <p className="text-gray-600">{profile?.phoneNumber}</p>
            <p className="text-gray-600">{university}</p>
            <p className="text-gray-600">{degree}</p>
            <p className="text-gray-600">{year}</p>
            <p className="text-gray-600">{semester}</p>
          </div>
        )}

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Active Devices</h3>
          <div className="space-y-2">
            {devices.length > 0 ? (
              devices.map((device) => (
                <div
                  key={device.id}
                  className="bg-gray-100 dark:bg-gray-700 p-3 rounded"
                >
                  <p className="font-medium">{device.deviceLabel}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Last used:{" "}
                    {new Date(device.lastUsedAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(device.fingerprint as any)?.userAgent || "Unknown device"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No devices found</p>
            )}
          </div>
        </div>

        <SignOutButton />
      </div>
    </>
  );
}
