import { defineQuery } from "next-sanity";

// Optimized search query with better indexing and simpler sorting
export const NOTES_QUERY =
  defineQuery(`*[_type == "note" && defined(slug.current) && 
    (!defined($search) || 
      title match $search + "*" ||
      subject match $search + "*" ||
      (length($search) >= 3 && pt::text(syllabus) match $search + "*")
    ) &&
    (!defined($university) || university == $university) &&
    (!defined($degree) || degree == $degree) &&
    (!defined($year) || year == $year) &&
    (!defined($semester) || semester == $semester) &&
    (!defined($subject) || lower(subject) match lower($subject)) &&
    (!defined($premium) || 
      ($premium == "free" && (!defined(isPremium) || isPremium == false)) ||
      ($premium == "premium" && isPremium == true)
    ) &&
    (!defined($type) || 
      ($type == "all") ||
      ($type == "notes" && type == "NOTES") ||
      ($type == "mst" && type == "MST") ||
      ($type == "pyq" && type == "PYQ") ||
      ($type == "one-shot" && type == "ONE-SHOT") ||
      ($type == "video-material" && type == "VIDEO-MATERIAL") ||
      ($type == "handwritten-notes" && type == "HANDWRITTEN-NOTES")
    ) &&
    (!defined($lastTitle) || title > $lastTitle || (title == $lastTitle && _id > $lastId))
  ] | order(title asc, _id asc) [0...6] {
  _id,
  _createdAt,
  title,
  syllabus,
  slug,
  university,
  degree,
  year,
  semester,
  subject,
  type,
  isPremium,
  tier,
  "searchScore": select(
    defined($search) && title match $search + "*" => 3,
    defined($search) && subject match $search + "*" => 2,
    defined($search) && pt::text(syllabus) match $search + "*" => 1,
    true => 0
  )
}`);

// Optimized count query
export const NOTES_COUNT_QUERY =
  defineQuery(`count(*[_type == "note" && defined(slug.current) && 
    (!defined($search) || 
      title match $search + "*" ||
      subject match $search + "*" ||
      (length($search) >= 3 && pt::text(syllabus) match $search + "*")
    ) &&
    (!defined($university) || university == $university) &&
    (!defined($degree) || degree == $degree) &&
    (!defined($year) || year == $year) &&
    (!defined($semester) || semester == $semester) &&
    (!defined($subject) || lower(subject) match lower($subject)) &&
    (!defined($premium) || 
      ($premium == "free" && (!defined(isPremium) || isPremium == false)) ||
      ($premium == "premium" && isPremium == true)
    ) &&
    (!defined($type) || 
      ($type == "all") ||
      ($type == "notes" && type == "NOTES") ||
      ($type == "mst" && type == "MST") ||
      ($type == "pyq" && type == "PYQ") ||
      ($type == "one-shot" && type == "ONE-SHOT") ||
      ($type == "video-material" && type == "VIDEO-MATERIAL") ||
      ($type == "handwritten-notes" && type == "HANDWRITTEN-NOTES")
    )
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
  type,
  tier,
  "headings": content[style in ["h2", "h3", "h4", "h5", "h6"]],
  content,
  slug,
  isPremium
}  
`);
