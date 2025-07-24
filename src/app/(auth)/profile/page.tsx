import Container from "@/components/core/Container";
import {
  getUserFullProfile,
  getUserOnboardingStatus,
} from "@/dal/user/onboarding/query";
import { getUserDevices } from "@/dal/user/device/query";
import {
  getUserPremiumStatus,
  getUserPurchaseHistory,
} from "@/dal/premium/query";
import { getUserReferralStatus } from "@/dal/referral/query";
import { getSession, checkUserBlockedStatus } from "@/lib/db/user";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import ProfileClient from "@/components/profile/ProfileClient";
import { Device } from "@/types/device";

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

  // Fetch all necessary data
  const [
    isOnboarded,
    profile,
    devices,
    premiumStatus,
    purchases,
    referralStatus,
  ] = await Promise.all([
    getUserOnboardingStatus(session.user.id),
    getUserFullProfile(session.user.id),
    getUserDevices(session.user.id),
    getUserPremiumStatus(session.user.id),
    getUserPurchaseHistory(session.user.id),
    getUserReferralStatus(session.user.id).catch((error) => {
      console.error("Failed to load referral status:", error);
      // Return a default referral status
      return {
        hasReferralCode: false,
        referralCode: null,
        totalReferrals: 0,
        totalEarnings: 0,
        walletBalance: 0,
        referrals: [],
      };
    }),
  ]);

  // Check if user completed onboarding
  if (!isOnboarded.isOnboarded) {
    redirect("/onboarding");
  }

  return (
    <>
      <div className="bg-background min-h-screen">
        <Container>
          <div className="space-y-8 py-8">
            {/* Header */}
            <div className="space-y-4 text-center">
              <h1 className="font-excon text-4xl font-black md:text-5xl">
                Your Profile
              </h1>
              <p className="text-muted-foreground font-satoshi mx-auto max-w-2xl text-lg">
                Manage your account settings, premium status, and devices all in
                one place.
              </p>
            </div>

            {/* Main Content */}
            <div className="mx-auto max-w-6xl">
              <ProfileClient
                session={{
                  user: {
                    id: session.user.id,
                    name: session.user.name,
                    email: session.user.email,
                    image: session.user.image,
                    emailVerified: session.user.emailVerified
                      ? new Date(
                          session.user.emailVerified as unknown as
                            | string
                            | number
                            | Date,
                        )
                      : null,
                  },
                }}
                isOnboarded={{ isOnboarded: isOnboarded?.isOnboarded ?? false }}
                profile={profile}
                premiumStatus={{
                  ...premiumStatus,
                  expiryDate: premiumStatus.expiryDate
                    ? new Date(premiumStatus.expiryDate)
                    : null,
                }}
                purchases={purchases.map((purchase) => ({
                  id: purchase.id,
                  tier: purchase.tier,
                  originalAmount: Number(purchase.originalAmount),
                  finalAmount: Number(purchase.finalAmount),
                  discountAmount: Number(purchase.discountAmount),
                  currency: purchase.currency,
                  paymentStatus: purchase.paymentStatus,
                  isActive: purchase.isActive,
                  createdAt: new Date(purchase.createdAt),
                  expiryDate: new Date(purchase.expiryDate),
                  razorpayOrderId: purchase.razorpayOrderId || "",
                  razorpayPaymentId: purchase.razorpayPaymentId,
                  paymentMethod: purchase.paymentMethod,
                  failureReason: purchase.failureReason,
                  discountCode: purchase.discountCode,
                  referralCode: purchase.referralCode,
                }))}
                devices={devices.map((device): Device => {
                  const fingerprint = device.fingerprint as Record<
                    string,
                    unknown
                  >;
                  const screen = fingerprint?.screen as {
                    width: number;
                    height: number;
                    colorDepth: number;
                    pixelDepth: number;
                  };

                  return {
                    id: device.id,
                    deviceLabel: device.deviceLabel || "Unknown Device",
                    lastUsedAt: new Date(device.lastUsedAt),
                    createdAt: device.createdAt
                      ? new Date(device.createdAt)
                      : undefined,
                    isActive: true,
                    fingerprint: {
                      userAgent: fingerprint?.userAgent as string | undefined,
                      platform: fingerprint?.platform as string | undefined,
                      vendor: fingerprint?.vendor as string | undefined,
                      language: fingerprint?.language as string | undefined,
                      timezone: fingerprint?.timezone as string | undefined,
                      browserName: fingerprint?.browserName as
                        | string
                        | undefined,
                      cookieEnabled: fingerprint?.cookieEnabled as
                        | boolean
                        | undefined,
                      hardwareConcurrency: fingerprint?.hardwareConcurrency as
                        | number
                        | undefined,
                      maxTouchPoints: fingerprint?.maxTouchPoints as
                        | number
                        | undefined,
                      doNotTrack: fingerprint?.doNotTrack as string | null,
                      languages: fingerprint?.languages as string | undefined,
                      canvasFingerprint: fingerprint?.canvasFingerprint as
                        | string
                        | undefined,
                      screen: screen
                        ? {
                            width: screen.width,
                            height: screen.height,
                            colorDepth: screen.colorDepth,
                            pixelDepth: screen.pixelDepth,
                          }
                        : undefined,
                      screenResolution: screen
                        ? `${screen.width}x${screen.height}`
                        : undefined,
                    },
                  };
                })}
                referralStatus={referralStatus}
              />
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}
