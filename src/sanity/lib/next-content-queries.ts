import { defineQuery } from "next-sanity";

// Query to get next units from the same subject
export const NEXT_UNITS_QUERY = defineQuery(`
  *[_type == "note" && 
    university == $university &&
    degree == $degree &&
    year == $year &&
    semester == $semester &&
    subject == $subject &&
    slug.current != $currentSlug &&
    defined(slug.current)
  ] | order(title asc) [0...5] {
    _id,
    title,
    slug,
    syllabus,
    isPremium,
    tier
  }
`);

// Query to get other content types for the subject (MST, PYQ, etc.)
export const SUBJECT_OTHER_CONTENT_QUERY = defineQuery(`
  *[_type == "note" && 
    university == $university &&
    degree == $degree &&
    year == $year &&
    semester == $semester &&
    subject == $subject &&
    slug.current != $currentSlug &&
    defined(slug.current) &&
    (title match "*MST*" || title match "*PYQ*" || title match "*Question*" || title match "*Paper*")
  ] | order(title asc) [0...3] {
    _id,
    title,
    slug,
    syllabus,
    isPremium,
    tier
  }
`);
