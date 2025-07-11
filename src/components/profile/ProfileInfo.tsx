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
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-excon text-2xl font-bold">
              Profile Information
            </CardTitle>
            {isOnboarded && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEditClick}
                className="gap-2"
              >
                <PencilIcon type="duotone" className="h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6 md:flex-row">
            <Avatar className="border-border flex size-24 items-center justify-center rounded-full border-2">
              <AvatarImage src={session?.image || ""} />
              <AvatarFallback className="font-bold">
                {session.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>

            {/* Basic Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="font-excon text-xl font-semibold">
                  {session.name}
                </h3>
                <div className="mt-1 flex items-center gap-2">
                  <p className="text-muted-foreground">{session.email}</p>
                  {session.emailVerified && (
                    <Badge variant="secondary" className="gap-1">
                      <CheckCircleIcon type="duotone" className="h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>

              {isOnboarded && profile?.firstName && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">
                      Full Name
                    </label>
                    <p className="font-satoshi">
                      {profile.firstName} {profile.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">
                      Phone Number
                    </label>
                    <p className="font-satoshi">{profile.phoneNumber}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Academic Information */}
      {isOnboarded && (
        <Card>
          <CardHeader>
            <CardTitle className="font-excon text-xl font-semibold">
              Academic Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  University
                </label>
                <p className="font-satoshi">{university}</p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Degree
                </label>
                <p className="font-satoshi">{degree}</p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Year
                </label>
                <p className="font-satoshi">{year}</p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Semester
                </label>
                <p className="font-satoshi">{semester}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Onboarding Prompt */}
      {!isOnboarded && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
          <CardContent className="pt-6">
            <div className="space-y-3 text-center">
              <h3 className="font-excon text-lg font-semibold">
                Complete Your Profile
              </h3>
              <p className="text-muted-foreground font-satoshi">
                Please complete your profile to unlock all features and
                personalize your experience.
              </p>
              <Button asChild className="mt-4">
                <a href="/onboarding">Complete Profile</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
