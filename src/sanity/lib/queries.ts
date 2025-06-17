import { defineQuery } from "next-sanity";

export const NOTES_QUERY =
  defineQuery(`*[_type == "note" && defined(slug.current)] | order(_createdAt desc) {
  _id,
  title,
  syllabus,
  slug,
  views,
  university,
  degree,
  year,
  semester,
  subject
}`);
