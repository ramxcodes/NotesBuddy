import {
  UNIVERSITY_OPTIONS,
  DEGREE_OPTIONS,
  YEAR_OPTIONS,
  SEMESTER_OPTIONS,
} from "@/utils/constant";

export function getDisplayName(
  prismaValue: string,
  optionsObject:
    | typeof UNIVERSITY_OPTIONS
    | typeof DEGREE_OPTIONS
    | typeof YEAR_OPTIONS
    | typeof SEMESTER_OPTIONS
) {
  const option = Object.values(optionsObject).find(
    (option) => option.prismaValue === prismaValue
  );
  return option?.title || "";
}
