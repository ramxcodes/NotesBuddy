import { defineField, defineType } from "sanity";

export const customImageType = defineType({
  name: "customImage",
  title: "Custom Image",
  type: "image",
  options: {
    hotspot: true,
  },
  fields: [
    defineField({
      name: "alt",
      title: "Alternative Text",
      type: "string",
      description:
        "Important for SEO and accessibility. Describe what the image shows.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "caption",
      title: "Caption",
      type: "string",
      description: "Optional caption to display below the image",
    }),
  ],
});
