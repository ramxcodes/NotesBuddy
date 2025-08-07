import { defineQuery } from "next-sanity";

// Query to get next units from the same subject (only NOTES type)
export const NEXT_UNITS_QUERY = defineQuery(`
  *[_type == "note" && 
    university == $university &&
    degree == $degree &&
    year == $year &&
    semester == $semester &&
    subject == $subject &&
    type == "NOTES" &&
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

// Query to get exam-related content (MST, PYQ, ONE-SHOT, VIDEO-MATERIAL, HANDWRITTEN-NOTES)
export const SUBJECT_OTHER_CONTENT_QUERY = defineQuery(`
  *[_type == "note" && 
    university == $university &&
    degree == $degree &&
    year == $year &&
    semester == $semester &&
    subject == $subject &&
    (type == "MST" || type == "PYQ" || type == "ONE-SHOT" || type == "VIDEO-MATERIAL" || type == "HANDWRITTEN-NOTES") &&
    slug.current != $currentSlug &&
    defined(slug.current)
  ] | order(title asc) [0...3] {
    _id,
    title,
    slug,
    syllabus,
    isPremium,
    tier
  }
`);
