import { UserAccessStatus } from "@/dal/premium/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "next-view-transitions";
import { AlertTriangle, Lock, Zap } from "lucide-react";
import { getTierDisplayName } from "@/utils/academic-config";

interface AccessDeniedProps {
  accessStatus: UserAccessStatus;
}

export default function AccessDenied({ accessStatus }: AccessDeniedProps) {
  const { reason, userStatus, noteRequirements, mismatches } = accessStatus;

  const getReasonMessage = () => {
    switch (reason) {
      case "NO_PREMIUM":
        return {
          title: "Premium Subscription Required",
          description:
            "You need an active premium subscription to access this content.",
          icon: <Lock className="h-5 w-5" />,
        };
      case "INSUFFICIENT_TIER":
        return {
          title: "Higher Premium Tier Required",
          description: `This content requires ${noteRequirements.tier} but you have ${userStatus.tier}.`,
          icon: <Zap className="h-5 w-5" />,
        };
      case "ACADEMIC_MISMATCH":
        return {
          title: "Academic Profile Mismatch",
          description:
            "Your academic profile doesn't match the requirements for this content.",
          icon: <AlertTriangle className="h-5 w-5" />,
        };
      default:
        return {
          title: "Access Denied",
          description: "You don't have access to this content.",
          icon: <Lock className="h-5 w-5" />,
        };
    }
  };

  const reasonInfo = getReasonMessage();

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <Alert
        variant="destructive"
        className="neuro-md border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#757373]"
      >
        <div className="flex items-center gap-2">
          {reasonInfo.icon}
          <AlertTitle>{reasonInfo.title}</AlertTitle>
        </div>
        <AlertDescription className="mt-2">
          {reasonInfo.description}
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        {/* User's Current Status */}
        <Card className="neuro-md border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#757373]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="neuro-sm h-2 w-2 border-black"></div>
              Your Current Status
            </CardTitle>
            <CardDescription>
              Your current premium subscription and academic profile
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Premium Status:</span>
                <Badge
                  variant={userStatus.hasPremium ? "default" : "destructive"}
                  className="neuro-sm border-black bg-white text-black dark:bg-white dark:text-black"
                >
                  {userStatus.hasPremium ? "Active" : "Inactive"}
                </Badge>
              </div>

              {userStatus.hasPremium && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Tier:</span>
                    <Badge
                      variant="secondary"
                      className="neuro-sm border-black bg-white text-black dark:bg-white dark:text-black"
                    >
                      {userStatus.tier}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Days Remaining:</span>
                    <span className="text-sm">
                      {userStatus.daysRemaining} days
                    </span>
                  </div>
                </>
              )}
            </div>

            {userStatus.hasPremium && (
              <div className="space-y-2 border-t border-black pt-3">
                <h4 className="text-sm font-medium">Academic Profile:</h4>
                <div className="text-muted-foreground space-y-1 text-sm">
                  <div>University: {userStatus.university || "Not set"}</div>
                  <div>Degree: {userStatus.degree || "Not set"}</div>
                  <div>Year: {userStatus.year || "Not set"}</div>
                  <div>Semester: {userStatus.semester || "Not set"}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Note Requirements */}
        <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#757373]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="neuro-sm h-2 w-2 border-black"></div>
              Content Requirements
            </CardTitle>
            <CardDescription>
              What&apos;s needed to access this content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Required Tier:</span>
                <Badge
                  variant="outline"
                  className="neuro-sm border-black bg-white text-black dark:bg-white dark:text-black"
                >
                  {getTierDisplayName(noteRequirements.tier)}
                </Badge>
              </div>
            </div>

            <div className="space-y-2 border-t border-black pt-3">
              <h4 className="text-sm font-medium">Academic Requirements:</h4>
              <div className="text-muted-foreground space-y-1 text-sm">
                <div>University: {noteRequirements.university || "Any"}</div>
                <div>Degree: {noteRequirements.degree || "Any"}</div>
                <div>Year: {noteRequirements.year || "Any"}</div>
                <div>Semester: {noteRequirements.semester || "Any"}</div>
              </div>
            </div>

            {mismatches.length > 0 && (
              <div className="border-t border-black pt-3">
                <h4 className="mb-2 text-sm font-medium text-red-600">
                  Mismatches:
                </h4>
                <div className="space-y-1">
                  {mismatches.map((mismatch, index) => (
                    <div
                      key={index}
                      className="neuro-sm border-black bg-white p-2 text-xs dark:bg-white"
                    >
                      <div className="font-medium capitalize">
                        {mismatch.field}:
                      </div>
                      <div className="text-muted-foreground">
                        You have:{" "}
                        <span className="font-medium">
                          {mismatch.userValue}
                        </span>
                      </div>
                      <div className="text-muted-foreground">
                        Required:{" "}
                        <span className="font-medium">
                          {mismatch.requiredValue}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col justify-center gap-3 sm:flex-row">
        {!userStatus.hasPremium && (
          <Button asChild className="neuro-button">
            <Link href="/premium">Get Premium Access</Link>
          </Button>
        )}

        {userStatus.hasPremium && reason === "INSUFFICIENT_TIER" && (
          <Button asChild className="neuro-button">
            <Link href="/premium">Upgrade Your Plan</Link>
          </Button>
        )}

        {reason === "ACADEMIC_MISMATCH" && (
          <Button variant="outline" asChild className="neuro-button">
            <Link href="/profile">Update Profile</Link>
          </Button>
        )}

        <Button variant="outline" asChild className="neuro-button">
          <Link href="/notes">Browse Other Notes</Link>
        </Button>
      </div>
    </div>
  );
}
