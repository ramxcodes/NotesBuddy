import { defineQuery } from "next-sanity";

export const NOTES_QUERY =
  defineQuery(`*[_type == "note" && defined(slug.current) && !defined($search) || title match $search || university match $search || degree match $search || year match $search || semester match $search || subject match $search || syllabus match $search ] | order(_createdAt desc) {
  _id,
  title,
  syllabus,
  slug,
  university,
  degree,
  year,
  semester,
  subject
}`);

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
  slug
}  
`);
