import { defineField, defineType } from "sanity";

export const note = defineType({
  name: "note",
  title: "Note",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
    }),
    defineField({
      name: "syllabus",
      type: "string",
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: {
        source: "title",
      },
    }),
    defineField({
      name: "university",
      type: "string",
      options: {
        list: [
          { title: "Medicaps University", value: "medicaps" },
          { title: "IPS University", value: "ips" },
        ],
      },
    }),
    defineField({
      name: "degree",
      type: "string",
      options: {
        list: [
          { title: "B.Tech CSE", value: "btech-cse" },
          { title: "B.Tech IT", value: "btech-it" },
        ],
      },
    }),
    defineField({
      name: "year",
      type: "string",
      options: {
        list: [
          { title: "1st Year", value: "1st-year" },
          { title: "2nd Year", value: "2nd-year" },
          { title: "3rd Year", value: "3rd-year" },
          { title: "4th Year", value: "4th-year" },
        ],
      },
    }),
    defineField({
      name: "semester",
      type: "string",
      options: {
        list: [
          { title: "1st Semester", value: "1st-semester" },
          { title: "2nd Semester", value: "2nd-semester" },
          { title: "3rd Semester", value: "3rd-semester" },
          { title: "4th Semester", value: "4th-semester" },
          { title: "5th Semester", value: "5th-semester" },
          { title: "6th Semester", value: "6th-semester" },
          { title: "7th Semester", value: "7th-semester" },
          { title: "8th Semester", value: "8th-semester" },
        ],
      },
    }),
    defineField({
      name: "subject",
      type: "string",
    }),
    defineField({
      name: "type",
      type: "string",
      options: {
        list: [
          { title: "Notes", value: "NOTES" },
          { title: "MST", value: "MST" },
          { title: "PYQ", value: "PYQ" },
          { title: "One-Shot", value: "ONE-SHOT" },
        ],
      },
    }),
    defineField({
      name: "isPremium",
      type: "boolean",
    }),
    defineField({
      name: "tier",
      type: "string",
      options: {
        list: [
          { title: "Tier 1", value: "TIER_1" },
          { title: "Tier 2", value: "TIER_2" },
          { title: "Tier 3", value: "TIER_3" },
        ],
      },
      hidden: ({ document }) => !document?.isPremium,
    }),
    defineField({
      name: "content",
      type: "array",
      of: [
        { type: "block" },
        { type: "latex" },
        { type: "customImage" },
        { type: "table" },
        { type: "code" },
      ],
    }),
  ],
});
