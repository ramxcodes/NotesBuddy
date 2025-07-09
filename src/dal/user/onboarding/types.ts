import { z } from "zod";
import { ACADEMIC_CONFIG, getUniversities } from "@/utils/academic-config";

// Extract the prismaValue keys for Zod validation
const universityKeys = Object.keys(ACADEMIC_CONFIG) as [
  keyof typeof ACADEMIC_CONFIG,
  ...Array<keyof typeof ACADEMIC_CONFIG>,
];

// Get all unique degree keys across all universities
const getAllDegreeKeys = () => {
  const degreeKeys = new Set<string>();
  Object.values(ACADEMIC_CONFIG).forEach((university) => {
    Object.keys(university.degrees).forEach((degreeKey) => {
      degreeKeys.add(degreeKey);
    });
  });
  return Array.from(degreeKeys) as [string, ...string[]];
};

// Get all unique year keys across all universities and degrees
const getAllYearKeys = () => {
  const yearKeys = new Set<string>();
  Object.values(ACADEMIC_CONFIG).forEach((university) => {
    Object.values(university.degrees).forEach((degree) => {
      Object.keys(degree.years).forEach((yearKey) => {
        yearKeys.add(yearKey);
      });
    });
  });
  return Array.from(yearKeys) as [string, ...string[]];
};

// Get all unique semester keys across all universities, degrees, and years
const getAllSemesterKeys = () => {
  const semesterKeys = new Set<string>();
  Object.values(ACADEMIC_CONFIG).forEach((university) => {
    Object.values(university.degrees).forEach((degree) => {
      Object.values(degree.years).forEach((year) => {
        Object.keys(year.semesters).forEach((semesterKey) => {
          semesterKeys.add(semesterKey);
        });
      });
    });
  });
  return Array.from(semesterKeys) as [string, ...string[]];
};

// Zod schema using the centralized academic configuration
export const onboardingFormSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "Too long"),
  lastName: z.string().min(1, "Last name is required").max(50, "Too long"),
  phoneNumber: z
    .string()
    .length(10, "Phone number must be exactly 10 digits")
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  university: z.enum(universityKeys),
  degree: z.enum(getAllDegreeKeys()),
  year: z.enum(getAllYearKeys()),
  semester: z.enum(getAllSemesterKeys()),
});

export type OnboardingFormData = z.infer<typeof onboardingFormSchema>;

// Helper functions to get form options
export const getUniversityOptions = () =>
  getUniversities().map((university) => ({
    value: university.value,
    label: university.label,
  }));

export const getDegreeOptions = () => {
  const degrees = new Map();
  Object.values(ACADEMIC_CONFIG).forEach((university) => {
    Object.values(university.degrees).forEach((degree) => {
      degrees.set(degree.info.value, {
        value: degree.info.value,
        label: degree.info.label,
      });
    });
  });
  return Array.from(degrees.values());
};

export const getYearOptions = () => {
  const years = new Map();
  Object.values(ACADEMIC_CONFIG).forEach((university) => {
    Object.values(university.degrees).forEach((degree) => {
      Object.values(degree.years).forEach((year) => {
        years.set(year.info.value, {
          value: year.info.value,
          label: year.info.label,
        });
      });
    });
  });
  return Array.from(years.values());
};

export const getSemesterOptions = () => {
  const semesters = new Map();
  Object.values(ACADEMIC_CONFIG).forEach((university) => {
    Object.values(university.degrees).forEach((degree) => {
      Object.values(degree.years).forEach((year) => {
        Object.values(year.semesters).forEach((semester) => {
          semesters.set(semester.value, {
            value: semester.value,
            label: semester.label,
          });
        });
      });
    });
  });
  return Array.from(semesters.values());
};
