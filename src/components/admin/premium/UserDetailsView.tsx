"use client";

import React from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CreditCard,
  Gift,
  GraduationCap,
  Percent,
  Phone,
  RefreshCw,
  Star,
  University,
  User,
} from "lucide-react";
import { DetailedUser, User as BasicUser } from "./AdminPremiumGrantForm";

interface UserDetailsViewProps {
  user: BasicUser;
  details: DetailedUser | null;
  isLoading: boolean;
  onRefresh: () => void;
}

const UserDetailsView: React.FC<UserDetailsViewProps> = ({
  details,
  isLoading,
  onRefresh,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2">
          <div className="border-primary h-5 w-5 animate-spin rounded-full border-2 border-r-transparent" />
          Loading user details...
        </div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="text-muted-foreground py-8 text-center">
        No details available
      </div>
    );
  }

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(typeof amount === "string" ? parseFloat(amount) : amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">User Details</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="neuro-sm"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Basic User Information */}
      <Card className="neuro">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            {details.image ? (
              <Image
                src={details.image}
                alt={details.name}
                width={64}
                height={64}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-full">
                <User className="h-8 w-8" />
              </div>
            )}
            <div className="flex-1">
              <h4 className="text-xl font-bold">{details.name}</h4>
              <p className="text-muted-foreground">{details.email}</p>
              <p className="text-muted-foreground text-sm">
                Joined: {formatDate(details.createdAt)}
              </p>
            </div>
            <div className="text-right">
              {details.isPremiumActive ? (
                <Badge variant="default" className="mb-2">
                  <Star className="mr-1 h-3 w-3" />
                  Premium Active
                </Badge>
              ) : (
                <Badge variant="secondary" className="mb-2">
                  Free User
                </Badge>
              )}
              {details.currentPremiumTier && (
                <p className="text-sm font-medium">
                  {details.currentPremiumTier.replace("_", " ")}
                </p>
              )}
              {details.premiumExpiryDate && (
                <p className="text-muted-foreground text-xs">
                  Expires: {formatDate(details.premiumExpiryDate)}
                </p>
              )}
            </div>
          </div>

          {/* Profile Information */}
          {details.profile && (
            <div className="grid grid-cols-2 gap-4 border-t pt-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4" />
                  <span className="font-medium">Phone:</span>
                  <span>{details.profile.phoneNumber || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <University className="h-4 w-4" />
                  <span className="font-medium">University:</span>
                  <span>{details.profile.university || "N/A"}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <GraduationCap className="h-4 w-4" />
                  <span className="font-medium">Academic:</span>
                  <span>
                    {details.profile.degree} - Year {details.profile.year},
                    Semester {details.profile.semester}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Premium Purchase History */}
      <Card className="neuro">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Premium Purchase History ({details.premiumPurchases?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {details.premiumPurchases && details.premiumPurchases.length > 0 ? (
            <ScrollArea className="h-[500px]" data-lenis-prevent>
              <div className="space-y-4">
                {details.premiumPurchases.map((purchase) => (
                  <div
                    key={purchase.id}
                    className="space-y-3 rounded-lg border p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={purchase.isActive ? "default" : "secondary"}
                        >
                          {purchase.tier.replace("_", " ")}
                        </Badge>
                        <Badge
                          variant={
                            purchase.paymentStatus === "COMPLETED"
                              ? "default"
                              : purchase.paymentStatus === "PENDING"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {purchase.paymentStatus}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          {formatCurrency(purchase.finalAmount)}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {purchase.duration} days
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p>
                          <span className="font-medium">Original:</span>{" "}
                          {formatCurrency(purchase.originalAmount)}
                        </p>
                        <p>
                          <span className="font-medium">Discount:</span>{" "}
                          {formatCurrency(purchase.discountAmount)}
                        </p>
                        <p>
                          <span className="font-medium">Method:</span>{" "}
                          {purchase.paymentMethod || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p>
                          <span className="font-medium">Started:</span>{" "}
                          {formatDate(purchase.purchaseDate)}
                        </p>
                        <p>
                          <span className="font-medium">Expires:</span>{" "}
                          {formatDate(purchase.expiryDate)}
                        </p>
                        <p>
                          <span className="font-medium">Academic:</span>{" "}
                          {purchase.university} - {purchase.degree}
                        </p>
                      </div>
                    </div>

                    {purchase.discounts && purchase.discounts.length > 0 && (
                      <div className="border-t pt-2">
                        <p className="mb-1 text-xs font-medium">
                          Applied Discounts:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {purchase.discounts.map((discount, discountIndex) => (
                            <Badge
                              key={discountIndex}
                              variant="outline"
                              className="text-xs"
                            >
                              <Percent className="mr-1 h-3 w-3" />
                              {discount.discountType}: {discount.discountValue}%
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <p className="text-muted-foreground py-4 text-center">
              No premium purchases found
            </p>
          )}
        </CardContent>
      </Card>

      {/* Referral Rewards */}
      {details.referrerRewards && details.referrerRewards.length > 0 && (
        <Card className="neuro">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Referral Rewards ({details.referrerRewards.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-3">
                {details.referrerRewards.map((reward, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">
                        {formatCurrency(reward.rewardAmount)}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {reward.rewardType} • {formatDate(reward.createdAt)}
                      </p>
                    </div>
                    <Badge
                      variant={reward.isProcessed ? "default" : "secondary"}
                    >
                      {reward.isProcessed ? "Processed" : "Pending"}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserDetailsView;
