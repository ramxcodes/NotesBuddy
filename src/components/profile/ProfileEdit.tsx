"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  onboardingFormSchema,
  type OnboardingFormData,
  getUniversityOptions,
  getDegreeOptions,
  getYearOptions,
  getSemesterOptions,
} from "@/dal/user/onboarding/types";
import { useState } from "react";
import { XCircleIcon } from "@/components/icons/XCIrcleIcon";
import { telegramLogger } from "@/utils/telegram-logger";

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

interface ProfileEditProps {
  profile: UserProfileData;
  onSave: (data: OnboardingFormData) => Promise<void>;
  onCancel: () => void;
}

export function ProfileEdit({ profile, onSave, onCancel }: ProfileEditProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingFormSchema),
    defaultValues: {
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      phoneNumber: profile?.phoneNumber || "",
      university: profile?.university as
        | OnboardingFormData["university"]
        | undefined,
      degree: profile?.degree as OnboardingFormData["degree"] | undefined,
      year: profile?.year as OnboardingFormData["year"] | undefined,
      semester: profile?.semester as OnboardingFormData["semester"] | undefined,
    },
  });

  const onSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true);
    try {
      await onSave(data);
    } catch (error) {
      await telegramLogger("Failed to update profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#757373]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-excon text-2xl font-black">
              Edit Profile
            </CardTitle>
            <CardDescription className="font-satoshi font-bold text-black dark:text-white">
              Update your personal and academic information.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="gap-2 border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:hover:shadow-[3px_3px_0px_0px_#757373]"
            data-umami-event="profile-edit-cancel-button-click"
          >
            <XCircleIcon className="size-4" />
            Cancel
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="font-excon text-lg font-black text-black dark:text-white">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-black dark:text-white">
                        First Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John"
                          {...field}
                          className="border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all focus:translate-x-[-1px] focus:translate-y-[-1px] focus:shadow-[3px_3px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:focus:shadow-[3px_3px_0px_0px_#757373]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-black dark:text-white">
                        Last Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Doe"
                          {...field}
                          className="border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all focus:translate-x-[-1px] focus:translate-y-[-1px] focus:shadow-[3px_3px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:focus:shadow-[3px_3px_0px_0px_#757373]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-black dark:text-white">
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="9876543210"
                        {...field}
                        className="border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all focus:translate-x-[-1px] focus:translate-y-[-1px] focus:shadow-[3px_3px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:focus:shadow-[3px_3px_0px_0px_#757373]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Academic Information */}
            <div className="space-y-4">
              <h3 className="font-excon text-lg font-black text-black dark:text-white">
                Academic Information
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="university"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-black dark:text-white">
                        University
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger className="border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:hover:shadow-[3px_3px_0px_0px_#757373]">
                            <SelectValue placeholder="Select university" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[4px_4px_0px_0px_#757373]">
                          {getUniversityOptions().map((option) => (
                            <SelectItem
                              key={option.value}
                              value={option.value}
                              className="font-bold text-black transition-all hover:bg-black hover:text-white dark:text-white dark:hover:bg-white dark:hover:text-black"
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="degree"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-black dark:text-white">
                        Degree
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger className="border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:hover:shadow-[3px_3px_0px_0px_#757373]">
                            <SelectValue placeholder="Select degree" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[4px_4px_0px_0px_#757373]">
                          {getDegreeOptions().map((option) => (
                            <SelectItem
                              key={option.value}
                              value={option.value}
                              className="font-bold text-black transition-all hover:bg-black hover:text-white dark:text-white dark:hover:bg-white dark:hover:text-black"
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-black dark:text-white">
                        Year
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger className="border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:hover:shadow-[3px_3px_0px_0px_#757373]">
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[4px_4px_0px_0px_#757373]">
                          {getYearOptions().map((option) => (
                            <SelectItem
                              key={option.value}
                              value={option.value}
                              className="font-bold text-black transition-all hover:bg-black hover:text-white dark:text-white dark:hover:bg-white dark:hover:text-black"
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="semester"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-black dark:text-white">
                        Semester
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger className="border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:hover:shadow-[3px_3px_0px_0px_#757373]">
                            <SelectValue placeholder="Select semester" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[4px_4px_0px_0px_#757373]">
                          {getSemesterOptions().map((option) => (
                            <SelectItem
                              key={option.value}
                              value={option.value}
                              className="font-bold text-black transition-all hover:bg-black hover:text-white dark:text-white dark:hover:bg-white dark:hover:text-black"
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 border-2 border-black bg-black font-bold text-white shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/20 dark:bg-white dark:text-black dark:shadow-[2px_2px_0px_0px_#757373] dark:hover:shadow-[3px_3px_0px_0px_#757373]"
                data-umami-event="profile-edit-save-button-click"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:hover:shadow-[3px_3px_0px_0px_#757373]"
                data-umami-event="profile-edit-cancel-bottom-button-click"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
