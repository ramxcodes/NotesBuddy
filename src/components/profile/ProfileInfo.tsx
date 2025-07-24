import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PencilIcon, CheckCircleIcon } from "@phosphor-icons/react";
import { getDisplayName } from "@/lib/user/helper";
import {
  DEGREE_OPTIONS,
  SEMESTER_OPTIONS,
  UNIVERSITY_OPTIONS,
  YEAR_OPTIONS,
} from "@/utils/constant";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserProfileData {
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  university?: string | null;
  degree?: string | null;
  year?: string | null;
  semester?: string | null;
  createdAt?: Date | null;
}

interface UserSessionData {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  emailVerified?: Date | null;
}

interface ProfileInfoProps {
  profile: UserProfileData;
  session: UserSessionData;
  isOnboarded: boolean;
  onEditClick: () => void;
}

export function ProfileInfo({
  profile,
  session,
  isOnboarded,
  onEditClick,
}: ProfileInfoProps) {
  const university = getDisplayName(
    profile?.university || "",
    UNIVERSITY_OPTIONS,
  );
  const degree = getDisplayName(profile?.degree || "", DEGREE_OPTIONS);
  const year = getDisplayName(profile?.year || "", YEAR_OPTIONS);
  const semester = getDisplayName(profile?.semester || "", SEMESTER_OPTIONS);

  return (
    <div className="space-y-6">
      {/* User Basic Info */}
      <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#757373]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-excon text-2xl font-black">
              Profile Information
            </CardTitle>
            {isOnboarded && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEditClick}
                className="gap-2 border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] dark:border-white dark:bg-zinc-900 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:hover:shadow-[3px_3px_0px_0px_#757373]"
              >
                <PencilIcon type="duotone" className="h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6 md:flex-row">
            <Avatar className="flex size-24 items-center justify-center rounded-full border-4 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#757373]">
              <AvatarImage
                className="rounded-full"
                src={session?.image || ""}
              />
              <AvatarFallback className="rounded-full font-black text-black dark:text-white">
                {session.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>

            {/* Basic Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="font-excon text-xl font-black">
                  {session.name}
                </h3>
                <div className="mt-1 flex items-center gap-2">
                  <p className="font-bold text-black dark:text-white">
                    {session.email}
                  </p>
                  {session.emailVerified && (
                    <Badge
                      variant="secondary"
                      className="gap-1 border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] dark:border-white dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373]"
                    >
                      <CheckCircleIcon type="duotone" className="h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>

              {isOnboarded && profile?.firstName && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-md border-2 border-black bg-white p-3 shadow-[2px_2px_0px_0px_#000] dark:border-white dark:bg-zinc-800 dark:shadow-[2px_2px_0px_0px_#757373]">
                    <label className="text-sm font-black text-black dark:text-white">
                      Full Name
                    </label>
                    <p className="font-satoshi font-bold text-black dark:text-white">
                      {profile.firstName} {profile.lastName}
                    </p>
                  </div>
                  <div className="rounded-md border-2 border-black bg-white p-3 shadow-[2px_2px_0px_0px_#000] dark:border-white dark:bg-zinc-800 dark:shadow-[2px_2px_0px_0px_#757373]">
                    <label className="text-sm font-black text-black dark:text-white">
                      Phone Number
                    </label>
                    <p className="font-satoshi font-bold text-black dark:text-white">
                      {profile.phoneNumber}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Academic Information */}
      {isOnboarded && (
        <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#757373]">
          <CardHeader>
            <CardTitle className="font-excon text-xl font-black">
              Academic Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-md border-2 border-black bg-white p-3 shadow-[2px_2px_0px_0px_#000] dark:border-white dark:bg-zinc-800 dark:shadow-[2px_2px_0px_0px_#757373]">
                <label className="text-sm font-black text-black dark:text-white">
                  University
                </label>
                <p className="font-satoshi font-bold text-black dark:text-white">
                  {university}
                </p>
              </div>
              <div className="rounded-md border-2 border-black bg-white p-3 shadow-[2px_2px_0px_0px_#000] dark:border-white dark:bg-zinc-800 dark:shadow-[2px_2px_0px_0px_#757373]">
                <label className="text-sm font-black text-black dark:text-white">
                  Degree
                </label>
                <p className="font-satoshi font-bold text-black dark:text-white">
                  {degree}
                </p>
              </div>
              <div className="rounded-md border-2 border-black bg-white p-3 shadow-[2px_2px_0px_0px_#000] dark:border-white dark:bg-zinc-800 dark:shadow-[2px_2px_0px_0px_#757373]">
                <label className="text-sm font-black text-black dark:text-white">
                  Year
                </label>
                <p className="font-satoshi font-bold text-black dark:text-white">
                  {year}
                </p>
              </div>
              <div className="rounded-md border-2 border-black bg-white p-3 shadow-[2px_2px_0px_0px_#000] dark:border-white dark:bg-zinc-800 dark:shadow-[2px_2px_0px_0px_#757373]">
                <label className="text-sm font-black text-black dark:text-white">
                  Semester
                </label>
                <p className="font-satoshi font-bold text-black dark:text-white">
                  {semester}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Onboarding Prompt */}
      {!isOnboarded && (
        <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white dark:bg-zinc-800 dark:shadow-[4px_4px_0px_0px_#757373]">
          <CardContent className="pt-6">
            <div className="space-y-3 text-center">
              <h3 className="font-excon text-lg font-black text-black dark:text-white">
                Complete Your Profile
              </h3>
              <p className="font-satoshi font-bold text-black dark:text-white">
                Please complete your profile to unlock all features and
                personalize your experience.
              </p>
              <Button
                asChild
                className="mt-4 border-2 border-black bg-black font-bold text-white shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] dark:border-white dark:bg-white dark:text-black dark:shadow-[2px_2px_0px_0px_#757373] dark:hover:shadow-[3px_3px_0px_0px_#757373]"
              >
                <a href="/onboarding">Complete Profile</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
