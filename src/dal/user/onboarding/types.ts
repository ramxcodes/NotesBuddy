import { z } from "zod";
import {
  UNIVERSITY_OPTIONS,
  DEGREE_OPTIONS,
  YEAR_OPTIONS,
  SEMESTER_OPTIONS,
} from "@/utils/constant";

// Extract the prismaValue keys for Zod validation
const universityKeys = Object.keys(UNIVERSITY_OPTIONS) as [
  keyof typeof UNIVERSITY_OPTIONS,
  ...Array<keyof typeof UNIVERSITY_OPTIONS>,
];
const degreeKeys = Object.keys(DEGREE_OPTIONS) as [
  keyof typeof DEGREE_OPTIONS,
  ...Array<keyof typeof DEGREE_OPTIONS>,
];
const yearKeys = Object.keys(YEAR_OPTIONS) as [
  keyof typeof YEAR_OPTIONS,
  ...Array<keyof typeof YEAR_OPTIONS>,
];
const semesterKeys = Object.keys(SEMESTER_OPTIONS) as [
  keyof typeof SEMESTER_OPTIONS,
  ...Array<keyof typeof SEMESTER_OPTIONS>,
];

// Zod schema using your existing constants
export const onboardingFormSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "Too long"),
  lastName: z.string().min(1, "Last name is required").max(50, "Too long"),
  phoneNumber: z
    .string()
    .length(10, "Phone number must be exactly 10 digits")
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  university: z.enum(universityKeys),
  degree: z.enum(degreeKeys),
  year: z.enum(yearKeys),
  semester: z.enum(semesterKeys),
});

export type OnboardingFormData = z.infer<typeof onboardingFormSchema>;

// Helper functions to convert your constants to form options
export const getUniversityOptions = () =>
  Object.entries(UNIVERSITY_OPTIONS).map(([key, value]) => ({
    value: key,
    label: value.title,
  }));

export const getDegreeOptions = () =>
  Object.entries(DEGREE_OPTIONS).map(([key, value]) => ({
    value: key,
    label: value.title,
  }));

export const getYearOptions = () =>
  Object.entries(YEAR_OPTIONS).map(([key, value]) => ({
    value: key,
    label: value.title,
  }));

export const getSemesterOptions = () =>
  Object.entries(SEMESTER_OPTIONS).map(([key, value]) => ({
    value: key,
    label: value.title,
  }));
