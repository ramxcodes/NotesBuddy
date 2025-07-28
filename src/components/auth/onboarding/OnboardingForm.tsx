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
} from "@/dal/user/onboarding/types";
import {
  getDegreesByUniversity,
  getYearsByUniversityAndDegree,
  getSemestersByUniversityDegreeAndYear,
  type AcademicOption,
} from "@/utils/academic-config";
import { handleOnboarding } from "@/app/(auth)/onboarding/actions";
import { useState, useEffect } from "react";
import { UserIcon } from "@/components/icons/UserIcon";
import { GraduationCapIcon } from "@/components/icons/GraduationCapIcon";
import { ArrowRightIcon } from "@/components/icons/ArrowRightIcon";

export function OnboardingForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [availableDegrees, setAvailableDegrees] = useState<AcademicOption[]>(
    [],
  );
  const [availableYears, setAvailableYears] = useState<AcademicOption[]>([]);
  const [availableSemesters, setAvailableSemesters] = useState<
    AcademicOption[]
  >([]);

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      university: undefined,
      degree: undefined,
      year: undefined,
      semester: undefined,
    },
  });

  // Watch form values to trigger cascading updates
  const watchedUniversity = form.watch("university");
  const watchedDegree = form.watch("degree");
  const watchedYear = form.watch("year");

  // Update available degrees when university changes
  useEffect(() => {
    if (watchedUniversity) {
      const degrees = getDegreesByUniversity(watchedUniversity);
      setAvailableDegrees(degrees);

      // Reset dependent fields
      form.resetField("degree");
      form.resetField("year");
      form.resetField("semester");
      setAvailableYears([]);
      setAvailableSemesters([]);
    } else {
      setAvailableDegrees([]);
      setAvailableYears([]);
      setAvailableSemesters([]);
    }
  }, [watchedUniversity, form]);

  // Update available years when university or degree changes
  useEffect(() => {
    if (watchedUniversity && watchedDegree) {
      const years = getYearsByUniversityAndDegree(
        watchedUniversity,
        watchedDegree,
      );
      setAvailableYears(years);

      // Reset dependent fields
      form.resetField("year");
      form.resetField("semester");
      setAvailableSemesters([]);
    } else {
      setAvailableYears([]);
      setAvailableSemesters([]);
    }
  }, [watchedUniversity, watchedDegree, form]);

  // Update available semesters when university, degree, or year changes
  useEffect(() => {
    if (watchedUniversity && watchedDegree && watchedYear) {
      const semesters = getSemestersByUniversityDegreeAndYear(
        watchedUniversity,
        watchedDegree,
        watchedYear,
      );
      setAvailableSemesters(semesters);

      // Reset semester field
      form.resetField("semester");
    } else {
      setAvailableSemesters([]);
    }
  }, [watchedUniversity, watchedDegree, watchedYear, form]);

  const onSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value as string);
      });

      const result = await handleOnboarding(formData);

      if (!result.success) {
        if (result.fieldErrors) {
          // Set field-specific errors
          Object.entries(result.fieldErrors).forEach(([field, errors]) => {
            if (errors && errors.length > 0) {
              form.setError(field as keyof OnboardingFormData, {
                type: "server",
                message: errors[0],
              });
            }
          });
        }

        if (result.error) {
          setSubmitError(result.error);
        }
      }
      // If successful, the action will redirect automatically
    } catch {
      setSubmitError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header Section */}
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-md border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#757373]">
            <UserIcon className="h-8 w-8 text-black dark:text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="font-excon text-3xl font-black tracking-tight text-black dark:text-white">
              Complete Your Profile
            </h1>
            <p className="font-satoshi mx-auto max-w-md text-lg font-bold text-black dark:text-white">
              Help us personalize your experience. If you fill this form, get
              notes for your semester & also purchase premium notes.
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Personal Information Card */}
            <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#757373]">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[2px_2px_0px_0px_#757373]">
                    <UserIcon className="h-5 w-5 text-black dark:text-white" />
                  </div>
                  <div>
                    <CardTitle className="font-excon text-lg font-black text-black dark:text-white">
                      Personal Information
                    </CardTitle>
                    <CardDescription className="font-satoshi text-sm font-bold text-black dark:text-white">
                      Your basic details for account personalization
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-satoshi text-sm font-bold text-black dark:text-white">
                          First Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Raj"
                            {...field}
                            className="h-11 border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all focus:translate-x-[-1px] focus:translate-y-[-1px] focus:shadow-[3px_3px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:focus:shadow-[3px_3px_0px_0px_#757373]"
                          />
                        </FormControl>
                        <FormMessage className="font-satoshi text-xs font-bold" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-satoshi text-sm font-bold text-black dark:text-white">
                          Last Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Kumar"
                            {...field}
                            className="h-11 border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all focus:translate-x-[-1px] focus:translate-y-[-1px] focus:shadow-[3px_3px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:focus:shadow-[3px_3px_0px_0px_#757373]"
                          />
                        </FormControl>
                        <FormMessage className="font-satoshi text-xs font-bold" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-satoshi text-sm font-bold text-black dark:text-white">
                        Phone Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="9876543210"
                          {...field}
                          className="h-11 border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all focus:translate-x-[-1px] focus:translate-y-[-1px] focus:shadow-[3px_3px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:focus:shadow-[3px_3px_0px_0px_#757373]"
                          type="tel"
                        />
                      </FormControl>
                      <FormMessage className="font-satoshi text-xs font-bold" />
                    </FormItem>
                  )}
                />
                {submitError && (
                  <p className="hidden text-xs text-red-500">{submitError}</p>
                )}
              </CardContent>
            </Card>

            {/* Academic Information Card */}
            <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#757373]">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[2px_2px_0px_0px_#757373]">
                    <GraduationCapIcon className="h-5 w-5 text-black dark:text-white" />
                  </div>
                  <div>
                    <CardTitle className="font-excon text-lg font-black text-black dark:text-white">
                      Academic Information
                    </CardTitle>
                    <CardDescription className="font-satoshi text-sm font-bold text-black dark:text-white">
                      Your university and course details for relevant content
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="university"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-satoshi text-sm font-bold text-black dark:text-white">
                          University
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger 
                              data-umami-event="onboarding-university-select-trigger"
                              className="h-11 border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all focus:translate-x-[-1px] focus:translate-y-[-1px] focus:shadow-[3px_3px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:focus:shadow-[3px_3px_0px_0px_#757373]">
                              <SelectValue placeholder="Select university" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[4px_4px_0px_0px_#757373]">
                            {getUniversityOptions().map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                                data-umami-event={`onboarding-university-select-${option.value}`}
                                className="font-satoshi font-bold text-black dark:text-white"
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="font-satoshi text-xs font-bold" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="degree"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-satoshi text-sm font-bold text-black dark:text-white">
                          Degree
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                          disabled={
                            !watchedUniversity || availableDegrees.length === 0
                          }
                        >
                          <FormControl>
                            <SelectTrigger 
                              data-umami-event="onboarding-degree-select-trigger"
                              className="h-11 border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all focus:translate-x-[-1px] focus:translate-y-[-1px] focus:shadow-[3px_3px_0px_0px_#000] disabled:opacity-50 dark:border-white/20 dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:focus:shadow-[3px_3px_0px_0px_#757373]">
                              <SelectValue
                                placeholder={
                                  !watchedUniversity
                                    ? "Select university first"
                                    : availableDegrees.length === 0
                                      ? "No degrees available"
                                      : "Select degree"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[4px_4px_0px_0px_#757373]">
                            {availableDegrees.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                                data-umami-event={`onboarding-degree-select-${option.value}`}
                                className="font-satoshi font-bold text-black dark:text-white"
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="font-satoshi text-xs font-bold" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-satoshi text-sm font-bold text-black dark:text-white">
                          Year
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                          disabled={
                            !watchedUniversity ||
                            !watchedDegree ||
                            availableYears.length === 0
                          }
                        >
                          <FormControl>
                            <SelectTrigger 
                              data-umami-event="onboarding-year-select-trigger"
                              className="h-11 border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all focus:translate-x-[-1px] focus:translate-y-[-1px] focus:shadow-[3px_3px_0px_0px_#000] disabled:opacity-50 dark:border-white/20 dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:focus:shadow-[3px_3px_0px_0px_#757373]">
                              <SelectValue
                                placeholder={
                                  !watchedUniversity
                                    ? "Select university first"
                                    : !watchedDegree
                                      ? "Select degree first"
                                      : availableYears.length === 0
                                        ? "No years available"
                                        : "Select year"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[4px_4px_0px_0px_#757373]">
                            {availableYears.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                                data-umami-event={`onboarding-year-select-${option.value}`}
                                className="font-satoshi font-bold text-black dark:text-white"
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="font-satoshi text-xs font-bold" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="semester"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-satoshi text-sm font-bold text-black dark:text-white">
                          Semester
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                          disabled={
                            !watchedUniversity ||
                            !watchedDegree ||
                            !watchedYear ||
                            availableSemesters.length === 0
                          }
                        >
                          <FormControl>
                            <SelectTrigger 
                              data-umami-event="onboarding-semester-select-trigger"
                              className="h-11 border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all focus:translate-x-[-1px] focus:translate-y-[-1px] focus:shadow-[3px_3px_0px_0px_#000] disabled:opacity-50 dark:border-white/20 dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:focus:shadow-[3px_3px_0px_0px_#757373]">
                              <SelectValue
                                placeholder={
                                  !watchedUniversity
                                    ? "Select university first"
                                    : !watchedDegree
                                      ? "Select degree first"
                                      : !watchedYear
                                        ? "Select year first"
                                        : availableSemesters.length === 0
                                          ? "No semesters available"
                                          : "Select semester"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[4px_4px_0px_0px_#757373]">
                            {availableSemesters.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                                data-umami-event={`onboarding-semester-select-${option.value}`}
                                className="font-satoshi font-bold text-black dark:text-white"
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="font-satoshi text-xs font-bold" />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                data-umami-event="onboarding-form-submit"
                className="h-12 min-w-[200px] border-2 border-black bg-white px-8 text-base font-bold text-black shadow-[4px_4px_0px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[6px_6px_0px_0px_#000] disabled:opacity-50 dark:border-white/20 dark:bg-zinc-800 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373] dark:hover:shadow-[6px_6px_0px_0px_#757373]"
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Creating Profile...
                  </>
                ) : (
                  <div className="flex items-center text-black hover:text-white dark:text-white">
                    Complete Onboarding
                    <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
