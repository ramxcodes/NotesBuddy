// Academic Configuration System
// This file defines the hierarchical relationships between university, degree, year, and semester

export interface AcademicOption {
  value: string;
  label: string;
  prismaValue: string;
  sanityValue: string;
}

export interface UniversityConfig {
  info: AcademicOption;
  degrees: Record<string, DegreeConfig>;
}

export interface DegreeConfig {
  info: AcademicOption;
  years: Record<string, YearConfig>;
}

export interface YearConfig {
  info: AcademicOption;
  semesters: Record<string, AcademicOption>;
}

export const ACADEMIC_CONFIG: Record<string, UniversityConfig> = {
  MEDICAPS: {
    info: {
      value: "MEDICAPS",
      label: "Medicaps University",
      prismaValue: "MEDICAPS",
      sanityValue: "medicaps",
    },
    degrees: {
      BTECH_CSE: {
        info: {
          value: "BTECH_CSE",
          label: "B.Tech CSE",
          prismaValue: "BTECH_CSE",
          sanityValue: "btech-cse",
        },
        years: {
          FIRST_YEAR: {
            info: {
              value: "FIRST_YEAR",
              label: "1st Year",
              prismaValue: "FIRST_YEAR",
              sanityValue: "1st-year",
            },
            semesters: {
              FIRST_SEMESTER: {
                value: "FIRST_SEMESTER",
                label: "1st Semester",
                prismaValue: "FIRST_SEMESTER",
                sanityValue: "1st-semester",
              },
              SECOND_SEMESTER: {
                value: "SECOND_SEMESTER",
                label: "2nd Semester",
                prismaValue: "SECOND_SEMESTER",
                sanityValue: "2nd-semester",
              },
            },
          },
          SECOND_YEAR: {
            info: {
              value: "SECOND_YEAR",
              label: "2nd Year",
              prismaValue: "SECOND_YEAR",
              sanityValue: "2nd-year",
            },
            semesters: {
              THIRD_SEMESTER: {
                value: "THIRD_SEMESTER",
                label: "3rd Semester",
                prismaValue: "THIRD_SEMESTER",
                sanityValue: "3rd-semester",
              },
              FOURTH_SEMESTER: {
                value: "FOURTH_SEMESTER",
                label: "4th Semester",
                prismaValue: "FOURTH_SEMESTER",
                sanityValue: "4th-semester",
              },
            },
          },
          THIRD_YEAR: {
            info: {
              value: "THIRD_YEAR",
              label: "3rd Year",
              prismaValue: "THIRD_YEAR",
              sanityValue: "3rd-year",
            },
            semesters: {
              FIFTH_SEMESTER: {
                value: "FIFTH_SEMESTER",
                label: "5th Semester",
                prismaValue: "FIFTH_SEMESTER",
                sanityValue: "5th-semester",
              },
              SIXTH_SEMESTER: {
                value: "SIXTH_SEMESTER",
                label: "6th Semester",
                prismaValue: "SIXTH_SEMESTER",
                sanityValue: "6th-semester",
              },
            },
          },
          FOURTH_YEAR: {
            info: {
              value: "FOURTH_YEAR",
              label: "4th Year",
              prismaValue: "FOURTH_YEAR",
              sanityValue: "4th-year",
            },
            semesters: {
              SEVENTH_SEMESTER: {
                value: "SEVENTH_SEMESTER",
                label: "7th Semester",
                prismaValue: "SEVENTH_SEMESTER",
                sanityValue: "7th-semester",
              },
              EIGHTH_SEMESTER: {
                value: "EIGHTH_SEMESTER",
                label: "8th Semester",
                prismaValue: "EIGHTH_SEMESTER",
                sanityValue: "8th-semester",
              },
            },
          },
        },
      },
    },
  },
  IPS: {
    info: {
      value: "IPS",
      label: "IPS University",
      prismaValue: "IPS",
      sanityValue: "ips",
    },
    degrees: {
      BTECH_IT: {
        info: {
          value: "BTECH_IT",
          label: "B.Tech IT",
          prismaValue: "BTECH_IT",
          sanityValue: "btech-it",
        },
        years: {
          FIRST_YEAR: {
            info: {
              value: "FIRST_YEAR",
              label: "1st Year",
              prismaValue: "FIRST_YEAR",
              sanityValue: "1st-year",
            },
            semesters: {
              FIRST_SEMESTER: {
                value: "FIRST_SEMESTER",
                label: "1st Semester",
                prismaValue: "FIRST_SEMESTER",
                sanityValue: "1st-semester",
              },
              SECOND_SEMESTER: {
                value: "SECOND_SEMESTER",
                label: "2nd Semester",
                prismaValue: "SECOND_SEMESTER",
                sanityValue: "2nd-semester",
              },
            },
          },
          SECOND_YEAR: {
            info: {
              value: "SECOND_YEAR",
              label: "2nd Year",
              prismaValue: "SECOND_YEAR",
              sanityValue: "2nd-year",
            },
            semesters: {
              THIRD_SEMESTER: {
                value: "THIRD_SEMESTER",
                label: "3rd Semester",
                prismaValue: "THIRD_SEMESTER",
                sanityValue: "3rd-semester",
              },
              FOURTH_SEMESTER: {
                value: "FOURTH_SEMESTER",
                label: "4th Semester",
                prismaValue: "FOURTH_SEMESTER",
                sanityValue: "4th-semester",
              },
            },
          },
          THIRD_YEAR: {
            info: {
              value: "THIRD_YEAR",
              label: "3rd Year",
              prismaValue: "THIRD_YEAR",
              sanityValue: "3rd-year",
            },
            semesters: {
              FIFTH_SEMESTER: {
                value: "FIFTH_SEMESTER",
                label: "5th Semester",
                prismaValue: "FIFTH_SEMESTER",
                sanityValue: "5th-semester",
              },
              SIXTH_SEMESTER: {
                value: "SIXTH_SEMESTER",
                label: "6th Semester",
                prismaValue: "SIXTH_SEMESTER",
                sanityValue: "6th-semester",
              },
            },
          },
          FOURTH_YEAR: {
            info: {
              value: "FOURTH_YEAR",
              label: "4th Year",
              prismaValue: "FOURTH_YEAR",
              sanityValue: "4th-year",
            },
            semesters: {
              SEVENTH_SEMESTER: {
                value: "SEVENTH_SEMESTER",
                label: "7th Semester",
                prismaValue: "SEVENTH_SEMESTER",
                sanityValue: "7th-semester",
              },
              EIGHTH_SEMESTER: {
                value: "EIGHTH_SEMESTER",
                label: "8th Semester",
                prismaValue: "EIGHTH_SEMESTER",
                sanityValue: "8th-semester",
              },
            },
          },
        },
      },
    },
  },
} as const;

// Helper Functions

/**
 * Get all available universities
 */
export function getUniversities(): AcademicOption[] {
  return Object.values(ACADEMIC_CONFIG).map((university) => university.info);
}

/**
 * Get available degrees for a specific university
 */
export function getDegreesByUniversity(
  universityValue: string,
): AcademicOption[] {
  const university = ACADEMIC_CONFIG[universityValue];
  if (!university) return [];

  return Object.values(university.degrees).map((degree) => degree.info);
}

/**
 * Get available years for a specific university and degree
 */
export function getYearsByUniversityAndDegree(
  universityValue: string,
  degreeValue: string,
): AcademicOption[] {
  const university = ACADEMIC_CONFIG[universityValue];
  if (!university) return [];

  const degree = university.degrees[degreeValue];
  if (!degree) return [];

  return Object.values(degree.years).map((year) => year.info);
}

/**
 * Get available semesters for a specific university, degree, and year
 */
export function getSemestersByUniversityDegreeAndYear(
  universityValue: string,
  degreeValue: string,
  yearValue: string,
): AcademicOption[] {
  const university = ACADEMIC_CONFIG[universityValue];
  if (!university) return [];

  const degree = university.degrees[degreeValue];
  if (!degree) return [];

  const year = degree.years[yearValue];
  if (!year) return [];

  return Object.values(year.semesters);
}

/**
 * Get all options for filter dropdowns (includes "all" option)
 */
export function getFilterOptions() {
  return {
    universities: [
      { value: "all", label: "All Universities" },
      ...getUniversities().map((option) => ({
        value: option.sanityValue,
        label: option.label,
      })),
    ],
    degrees: [
      { value: "all", label: "All Degrees" },
      ...getAllDegrees().map((option) => ({
        value: option.sanityValue,
        label: option.label,
      })),
    ],
    years: [
      { value: "all", label: "All Years" },
      ...getAllYears().map((option) => ({
        value: option.sanityValue,
        label: option.label,
      })),
    ],
    semesters: [
      { value: "all", label: "All Semesters" },
      ...getAllSemesters().map((option) => ({
        value: option.sanityValue,
        label: option.label,
      })),
    ],
  };
}

/**
 * Get all unique degrees across all universities
 */
function getAllDegrees(): AcademicOption[] {
  const degrees = new Map<string, AcademicOption>();

  Object.values(ACADEMIC_CONFIG).forEach((university) => {
    Object.values(university.degrees).forEach((degree) => {
      degrees.set(degree.info.value, degree.info);
    });
  });

  return Array.from(degrees.values());
}

/**
 * Get all unique years across all universities and degrees
 */
function getAllYears(): AcademicOption[] {
  const years = new Map<string, AcademicOption>();

  Object.values(ACADEMIC_CONFIG).forEach((university) => {
    Object.values(university.degrees).forEach((degree) => {
      Object.values(degree.years).forEach((year) => {
        years.set(year.info.value, year.info);
      });
    });
  });

  return Array.from(years.values());
}

/**
 * Get all unique semesters across all universities, degrees, and years
 */
function getAllSemesters(): AcademicOption[] {
  const semesters = new Map<string, AcademicOption>();

  Object.values(ACADEMIC_CONFIG).forEach((university) => {
    Object.values(university.degrees).forEach((degree) => {
      Object.values(degree.years).forEach((year) => {
        Object.values(year.semesters).forEach((semester) => {
          semesters.set(semester.value, semester);
        });
      });
    });
  });

  return Array.from(semesters.values());
}

/**
 * Convert prisma values to sanity values
 */
export function prismaToSanityValue(
  type: "university" | "degree" | "year" | "semester",
  prismaValue: string,
): string | undefined {
  switch (type) {
    case "university":
      return Object.values(ACADEMIC_CONFIG).find(
        (university) => university.info.prismaValue === prismaValue,
      )?.info.sanityValue;
    case "degree":
      return getAllDegrees().find(
        (degree) => degree.prismaValue === prismaValue,
      )?.sanityValue;
    case "year":
      return getAllYears().find((year) => year.prismaValue === prismaValue)
        ?.sanityValue;
    case "semester":
      return getAllSemesters().find(
        (semester) => semester.prismaValue === prismaValue,
      )?.sanityValue;
    default:
      return undefined;
  }
}

/**
 * Convert sanity values to prisma values
 */
export function sanityToPrismaValue(
  type: "university" | "degree" | "year" | "semester",
  sanityValue: string,
): string | undefined {
  switch (type) {
    case "university":
      return Object.values(ACADEMIC_CONFIG).find(
        (university) => university.info.sanityValue === sanityValue,
      )?.info.prismaValue;
    case "degree":
      return getAllDegrees().find(
        (degree) => degree.sanityValue === sanityValue,
      )?.prismaValue;
    case "year":
      return getAllYears().find((year) => year.sanityValue === sanityValue)
        ?.prismaValue;
    case "semester":
      return getAllSemesters().find(
        (semester) => semester.sanityValue === sanityValue,
      )?.prismaValue;
    default:
      return undefined;
  }
}

/**
 * Get display name from sanity value
 */
export function getDisplayNameFromSanityValue(
  type: "university" | "degree" | "year" | "semester",
  sanityValue: string,
): string {
  switch (type) {
    case "university":
      return (
        Object.values(ACADEMIC_CONFIG).find(
          (university) => university.info.sanityValue === sanityValue,
        )?.info.label || sanityValue
      );
    case "degree":
      return (
        getAllDegrees().find((degree) => degree.sanityValue === sanityValue)
          ?.label || sanityValue
      );
    case "year":
      return (
        getAllYears().find((year) => year.sanityValue === sanityValue)?.label ||
        sanityValue
      );
    case "semester":
      return (
        getAllSemesters().find(
          (semester) => semester.sanityValue === sanityValue,
        )?.label || sanityValue
      );
    default:
      return sanityValue;
  }
}

export function getDisplayNameFromPrismaValue(
  type: "university" | "degree" | "year" | "semester",
  prismaValue: string,
): string {
  switch (type) {
    case "university":
      return (
        Object.values(ACADEMIC_CONFIG).find(
          (university) => university.info.prismaValue === prismaValue,
        )?.info.label || prismaValue
      );
    case "degree":
      return (
        getAllDegrees().find((degree) => degree.prismaValue === prismaValue)
          ?.label || prismaValue
      );
    case "year":
      return (
        getAllYears().find((year) => year.prismaValue === prismaValue)?.label ||
        prismaValue
      );
    case "semester":
      return (
        getAllSemesters().find(
          (semester) => semester.prismaValue === prismaValue,
        )?.label || prismaValue
      );
    default:
      return prismaValue;
  }
}

/**
 * Get default filter values (all options for each category)
 */
export function getDefaultFilterValues() {
  return {
    university: "all",
    degree: "all",
    year: "all",
    semester: "all",
  };
}

/**
 * Convert user profile to sanity filter values
 */
export function userProfileToFilterValues(profile: {
  university?: string;
  degree?: string;
  year?: string;
  semester?: string;
}) {
  return {
    university: profile.university
      ? prismaToSanityValue("university", profile.university) || "all"
      : "all",
    degree: profile.degree
      ? prismaToSanityValue("degree", profile.degree) || "all"
      : "all",
    year: profile.year
      ? prismaToSanityValue("year", profile.year) || "all"
      : "all",
    semester: profile.semester
      ? prismaToSanityValue("semester", profile.semester) || "all"
      : "all",
  };
}

export const normalizedTierValues = () => {
  return {
    TIER_1: "TIER 1",
    TIER_2: "TIER 2",
    TIER_3: "TIER 3",
  };
};

export const getTierDisplayName = (tier: string): string => {
  switch (tier) {
    case "TIER_1":
      return "TIER 1";
    case "TIER_2":
      return "TIER 2";
    case "TIER_3":
      return "TIER 3";
    default:
      return "Unknown Tier";
  }
};
