export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

import {
  UNIVERSITY_OPTIONS,
  DEGREE_OPTIONS,
  YEAR_OPTIONS,
  SEMESTER_OPTIONS,
} from "./constant";

// Convert prisma values to sanity values
export function prismaToSanityValue(
  type: "university" | "degree" | "year" | "semester",
  prismaValue: string,
): string | undefined {
  switch (type) {
    case "university":
      return Object.values(UNIVERSITY_OPTIONS).find(
        (option) => option.prismaValue === prismaValue,
      )?.sanityValue;
    case "degree":
      return Object.values(DEGREE_OPTIONS).find(
        (option) => option.prismaValue === prismaValue,
      )?.sanityValue;
    case "year":
      return Object.values(YEAR_OPTIONS).find(
        (option) => option.prismaValue === prismaValue,
      )?.sanityValue;
    case "semester":
      return Object.values(SEMESTER_OPTIONS).find(
        (option) => option.prismaValue === prismaValue,
      )?.sanityValue;
    default:
      return undefined;
  }
}

// Convert sanity values to prisma values
export function sanityToPrismaValue(
  type: "university" | "degree" | "year" | "semester",
  sanityValue: string,
): string | undefined {
  switch (type) {
    case "university":
      return Object.values(UNIVERSITY_OPTIONS).find(
        (option) => option.sanityValue === sanityValue,
      )?.prismaValue;
    case "degree":
      return Object.values(DEGREE_OPTIONS).find(
        (option) => option.sanityValue === sanityValue,
      )?.prismaValue;
    case "year":
      return Object.values(YEAR_OPTIONS).find(
        (option) => option.sanityValue === sanityValue,
      )?.prismaValue;
    case "semester":
      return Object.values(SEMESTER_OPTIONS).find(
        (option) => option.sanityValue === sanityValue,
      )?.prismaValue;
    default:
      return undefined;
  }
}

export function getDisplayNameFromSanityValue(
  type: "university" | "degree" | "year" | "semester",
  sanityValue: string,
) {
  switch (type) {
    case "university":
      return (
        Object.values(UNIVERSITY_OPTIONS).find(
          (option) => option.sanityValue === sanityValue,
        )?.title || sanityValue
      );
    case "degree":
      return (
        Object.values(DEGREE_OPTIONS).find(
          (option) => option.sanityValue === sanityValue,
        )?.title || sanityValue
      );
    case "year":
      return (
        Object.values(YEAR_OPTIONS).find(
          (option) => option.sanityValue === sanityValue,
        )?.title || sanityValue
      );
    case "semester":
      return (
        Object.values(SEMESTER_OPTIONS).find(
          (option) => option.sanityValue === sanityValue,
        )?.title || sanityValue
      );
    default:
      return sanityValue;
  }
}

// Get default filter values (first option for each category)
export function getDefaultFilterValues() {
  const firstUniversity = Object.values(UNIVERSITY_OPTIONS)[0];
  const firstDegree = Object.values(DEGREE_OPTIONS)[0];
  const firstYear = Object.values(YEAR_OPTIONS)[0];
  const firstSemester = Object.values(SEMESTER_OPTIONS)[0];

  return {
    university: firstUniversity.sanityValue,
    degree: firstDegree.sanityValue,
    year: firstYear.sanityValue,
    semester: firstSemester.sanityValue,
  };
}

// Get filter options for dropdowns
export function getFilterOptions() {
  return {
    universities: Object.values(UNIVERSITY_OPTIONS).map((option) => ({
      value: option.sanityValue,
      label: option.title,
    })),
    degrees: Object.values(DEGREE_OPTIONS).map((option) => ({
      value: option.sanityValue,
      label: option.title,
    })),
    years: Object.values(YEAR_OPTIONS).map((option) => ({
      value: option.sanityValue,
      label: option.title,
    })),
    semesters: Object.values(SEMESTER_OPTIONS).map((option) => ({
      value: option.sanityValue,
      label: option.title,
    })),
  };
}

// Convert user profile to sanity filter values
export function userProfileToFilterValues(profile: {
  university?: string;
  degree?: string;
  year?: string;
  semester?: string;
}) {
  return {
    university: profile.university
      ? prismaToSanityValue("university", profile.university)
      : getDefaultFilterValues().university,
    degree: profile.degree
      ? prismaToSanityValue("degree", profile.degree)
      : getDefaultFilterValues().degree,
    year: profile.year
      ? prismaToSanityValue("year", profile.year)
      : getDefaultFilterValues().year,
    semester: profile.semester
      ? prismaToSanityValue("semester", profile.semester)
      : getDefaultFilterValues().semester,
  };
}
