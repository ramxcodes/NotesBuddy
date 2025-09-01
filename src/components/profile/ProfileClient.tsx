"use client";

import React, { useState } from "react";
import SignOutButton from "@/components/auth/SignOutButton";
import { ProfileInfo } from "@/components/profile/ProfileInfo";
import { ProfileEdit } from "@/components/profile/ProfileEdit";
import { PremiumStatus } from "@/components/profile/PremiumStatus";
import { PremiumHistory } from "@/components/profile/PremiumHistory";
import { DeviceManagement } from "@/components/profile/DeviceManagement";
import { ReferralSection } from "@/components/profile/ReferralSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserIcon } from "@/components/icons/UserIcon";
import { CrownIcon } from "@/components/icons/CrownIcon";
import { ReceiptIcon } from "@/components/icons/ReceiptIcon";
import { DevicesIcon } from "@/components/icons/DevicesIcon";
import ShareNetworkIcon from "@/components/icons/ShareNetworkIcon";
import { SignOutIcon } from "@/components/icons/SignOutIcon";
import { OnboardingFormData } from "@/dal/user/onboarding/types";
import { handleProfileUpdate } from "@/app/(auth)/profile/actions";
import { Device } from "@/types/device";
import { ReferralStatus } from "@/dal/referral/types";
import { telegramLogger } from "@/utils/telegram-logger";

interface ProfileClientProps {
  session: {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      emailVerified?: Date | null;
    };
  };
  isOnboarded: { isOnboarded: boolean };
  profile: {
    firstName?: string | null;
    lastName?: string | null;
    phoneNumber?: string | null;
    university?: string | null;
    degree?: string | null;
    year?: string | null;
    semester?: string | null;
    createdAt?: Date | null;
  } | null;
  premiumStatus: {
    isActive: boolean;
    tier: "TIER_1" | "TIER_2" | "TIER_3" | null;
    expiryDate: Date | string | null;
    daysRemaining: number | null;
  };
  purchases: Array<{
    id: string;
    tier: "TIER_1" | "TIER_2" | "TIER_3";
    originalAmount: number;
    finalAmount: number;
    discountAmount: number;
    currency: string;
    paymentStatus: string;
    isActive: boolean;
    createdAt: Date | string;
    expiryDate: Date | string;
    razorpayOrderId: string;
    razorpayPaymentId?: string | null;
    paymentMethod?: string | null;
    failureReason?: string | null;
    discountCode?: string | null;
    referralCode?: string | null;
  }>;
  devices: Device[];
  referralStatus?: ReferralStatus;
}

export default function ProfileClient({
  session,
  isOnboarded,
  profile,
  premiumStatus,
  purchases,
  devices,
  referralStatus,
}: ProfileClientProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveProfile = async (data: OnboardingFormData) => {
    try {
      await handleProfileUpdate(data);
      setIsEditing(false);
    } catch (error) {
      await telegramLogger("Failed to update profile:", error);
      throw error;
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid h-auto w-full grid-cols-2 gap-4 border-2 border-black bg-white p-2 shadow-[4px_4px_0px_0px_#000] md:grid-cols-3 lg:grid-cols-6 dark:border-white/20 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#757373]">
        <TabsTrigger
          value="profile"
          className="gap-2 border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:cursor-pointer hover:shadow-[3px_3px_0px_0px_#000] data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:hover:shadow-[3px_3px_0px_0px_#757373] dark:data-[state=active]:bg-white dark:data-[state=active]:text-black dark:data-[state=active]:shadow-[2px_2px_0px_0px_#757373]"
        >
          <UserIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Profile</span>
        </TabsTrigger>
        <TabsTrigger
          value="premium"
          className="gap-2 border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:cursor-pointer hover:shadow-[3px_3px_0px_0px_#000] data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:hover:shadow-[3px_3px_0px_0px_#757373] dark:data-[state=active]:bg-white dark:data-[state=active]:text-black dark:data-[state=active]:shadow-[2px_2px_0px_0px_#757373]"
        >
          <CrownIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Premium</span>
        </TabsTrigger>
        <TabsTrigger
          value="referral"
          className="gap-2 border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:cursor-pointer hover:shadow-[3px_3px_0px_0px_#000] data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:hover:shadow-[3px_3px_0px_0px_#757373] dark:data-[state=active]:bg-white dark:data-[state=active]:text-black dark:data-[state=active]:shadow-[2px_2px_0px_0px_#757373]"
        >
          <ShareNetworkIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Referral</span>
        </TabsTrigger>
        <TabsTrigger
          value="history"
          className="gap-2 border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:cursor-pointer hover:shadow-[3px_3px_0px_0px_#000] data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:hover:shadow-[3px_3px_0px_0px_#757373] dark:data-[state=active]:bg-white dark:data-[state=active]:text-black dark:data-[state=active]:shadow-[2px_2px_0px_0px_#757373]"
        >
          <ReceiptIcon className="h-4 w-4" />
          <span className="hidden sm:inline">History</span>
        </TabsTrigger>
        <TabsTrigger
          value="devices"
          className="gap-2 border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:cursor-pointer hover:shadow-[3px_3px_0px_0px_#000] data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:hover:shadow-[3px_3px_0px_0px_#757373] dark:data-[state=active]:bg-white dark:data-[state=active]:text-black dark:data-[state=active]:shadow-[2px_2px_0px_0px_#757373]"
        >
          <DevicesIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Devices</span>
        </TabsTrigger>
        <TabsTrigger
          value="settings"
          className="gap-2 border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:cursor-pointer hover:shadow-[3px_3px_0px_0px_#000] data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:hover:shadow-[3px_3px_0px_0px_#757373] dark:data-[state=active]:bg-white dark:data-[state=active]:text-black dark:data-[state=active]:shadow-[2px_2px_0px_0px_#757373]"
        >
          <SignOutIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Settings</span>
        </TabsTrigger>
      </TabsList>

      <div className="mt-8">
        <TabsContent value="profile" className="space-y-6">
          {isEditing ? (
            <ProfileEdit
              profile={profile || {}}
              onSave={handleSaveProfile}
              onCancel={handleCancelEdit}
            />
          ) : (
            <ProfileInfo
              profile={profile || {}}
              session={session.user}
              isOnboarded={isOnboarded.isOnboarded}
              onEditClick={handleEditProfile}
            />
          )}
        </TabsContent>

        <TabsContent value="premium">
          <PremiumStatus premiumStatus={premiumStatus} />
        </TabsContent>

        <TabsContent value="referral">
          <ReferralSection initialReferralStatus={referralStatus} />
        </TabsContent>

        <TabsContent value="history">
          <PremiumHistory purchases={purchases} />
        </TabsContent>

        <TabsContent value="devices">
          <DeviceManagement devices={devices} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="max-w-2xl">
            <div className="space-y-4 rounded-lg border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#757373]">
              <h3 className="font-excon text-xl font-bold text-black dark:text-white">
                Account Settings
              </h3>
              <p className="font-satoshi text-zinc-600 dark:text-zinc-400">
                Manage your account preferences and security settings.
              </p>
              <div className="pt-4">
                <SignOutButton />
              </div>
            </div>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
}
