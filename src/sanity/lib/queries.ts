import { defineQuery } from "next-sanity";

export const NOTES_QUERY =
  defineQuery(`*[_type == "note" && defined(slug.current) && 
    (!defined($search) || title match $search || university match $search || degree match $search || year match $search || semester match $search || subject match $search || syllabus match $search) &&
    (!defined($university) || university == $university) &&
    (!defined($degree) || degree == $degree) &&
    (!defined($year) || year == $year) &&
    (!defined($semester) || semester == $semester) &&
    (!defined($subject) || subject match $subject)
  ] | order(_createdAt desc) [$start...$end] {
  _id,
  title,
  syllabus,
  slug,
  university,
  degree,
  year,
  semester,
  subject,
  isPremium,
  tier
}`);

export const NOTES_COUNT_QUERY =
  defineQuery(`count(*[_type == "note" && defined(slug.current) && 
    (!defined($search) || title match $search || university match $search || degree match $search || year match $search || semester match $search || subject match $search || syllabus match $search) &&
    (!defined($university) || university == $university) &&
    (!defined($degree) || degree == $degree) &&
    (!defined($year) || year == $year) &&
    (!defined($semester) || semester == $semester) &&
    (!defined($subject) || subject match $subject)
  ])`);

export const SUBJECTS_QUERY = defineQuery(`
  *[_type == "note" && defined(subject) &&
    (!defined($university) || university == $university) &&
    (!defined($degree) || degree == $degree) &&
    (!defined($year) || year == $year) &&
    (!defined($semester) || semester == $semester)
  ] {
    "subject": subject
  } | order(subject asc)
`);

export const NOTE_BY_SLUG_QUERY = defineQuery(`
*[_type == "note" && slug.current == $slug][0]{
 _id,
  title,
  syllabus,
  university,
  degree,
  year,
  semester,
  subject,
  tier,
  "headings": content[style in ["h2", "h3", "h4", "h5", "h6"]],
  content,
  slug,
  isPremium
}  
`);
