// Helper function to convert sanity values to prisma enum values
export function convertSanityValueToPrismaValue(
  type: "university" | "degree" | "year" | "semester",
  sanityValue: string,
): string | null {
  const conversionMaps = {
    university: {
      medicaps: "MEDICAPS",
      ips: "IPS",
    },
    degree: {
      "btech-cse": "BTECH_CSE",
      "btech-it": "BTECH_IT",
    },
    year: {
      "1st-year": "FIRST_YEAR",
      "2nd-year": "SECOND_YEAR",
      "3rd-year": "THIRD_YEAR",
      "4th-year": "FOURTH_YEAR",
    },
    semester: {
      "1st-semester": "FIRST_SEMESTER",
      "2nd-semester": "SECOND_SEMESTER",
      "3rd-semester": "THIRD_SEMESTER",
      "4th-semester": "FOURTH_SEMESTER",
      "5th-semester": "FIFTH_SEMESTER",
      "6th-semester": "SIXTH_SEMESTER",
      "7th-semester": "SEVENTH_SEMESTER",
      "8th-semester": "EIGHTH_SEMESTER",
    },
  };

  return (
    conversionMaps[type][
      sanityValue as keyof (typeof conversionMaps)[typeof type]
    ] || null
  );
}

// Helper function to convert prisma enum values to display format
export function convertPrismaValueToDisplayFormat(
  type: "university" | "degree" | "year" | "semester",
  prismaValue: string,
): string {
  const displayMaps = {
    university: {
      MEDICAPS: "Medicaps University",
      IPS: "IPS University",
    },
    degree: {
      BTECH_CSE: "B.Tech CSE",
      BTECH_IT: "B.Tech IT",
    },
    year: {
      FIRST_YEAR: "1st Year",
      SECOND_YEAR: "2nd Year",
      THIRD_YEAR: "3rd Year",
      FOURTH_YEAR: "4th Year",
    },
    semester: {
      FIRST_SEMESTER: "1st Semester",
      SECOND_SEMESTER: "2nd Semester",
      THIRD_SEMESTER: "3rd Semester",
      FOURTH_SEMESTER: "4th Semester",
      FIFTH_SEMESTER: "5th Semester",
      SIXTH_SEMESTER: "6th Semester",
      SEVENTH_SEMESTER: "7th Semester",
      EIGHTH_SEMESTER: "8th Semester",
    },
  };

  return (
    displayMaps[type][prismaValue as keyof (typeof displayMaps)[typeof type]] ||
    prismaValue
  );
}
