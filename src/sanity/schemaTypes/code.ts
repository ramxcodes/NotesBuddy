import { defineField, defineType } from "sanity";

export const codeType = defineType({
  name: "code",
  title: "Code Block",
  type: "object",
  fields: [
    defineField({
      name: "language",
      title: "Language",
      type: "string",
      options: {
        list: [
          { title: "Plain Text", value: "text" },
          { title: "JavaScript", value: "javascript" },
          { title: "TypeScript", value: "typescript" },
          { title: "Python", value: "python" },
          { title: "Java", value: "java" },
          { title: "C", value: "c" },
          { title: "C++", value: "cpp" },
          { title: "C#", value: "csharp" },
          { title: "PHP", value: "php" },
          { title: "Ruby", value: "ruby" },
          { title: "Go", value: "go" },
          { title: "Rust", value: "rust" },
          { title: "Swift", value: "swift" },
          { title: "Kotlin", value: "kotlin" },
          { title: "HTML", value: "html" },
          { title: "CSS", value: "css" },
          { title: "SCSS", value: "scss" },
          { title: "SQL", value: "sql" },
          { title: "Shell/Bash", value: "bash" },
          { title: "PowerShell", value: "powershell" },
          { title: "JSON", value: "json" },
          { title: "XML", value: "xml" },
          { title: "YAML", value: "yaml" },
          { title: "Markdown", value: "markdown" },
          { title: "Dockerfile", value: "dockerfile" },
          { title: "R", value: "r" },
          { title: "MATLAB", value: "matlab" },
          { title: "Perl", value: "perl" },
          { title: "Lua", value: "lua" },
          { title: "Assembly", value: "assembly" },
        ],
        layout: "dropdown",
      },
      initialValue: "text",
    }),
    defineField({
      name: "code",
      title: "Code",
      type: "text",
      description: "The code content",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "filename",
      title: "Filename",
      type: "string",
      description: "Optional filename to display above the code block",
    }),
  ],
  preview: {
    select: {
      title: "filename",
      subtitle: "language",
    },
    prepare({ title, subtitle }) {
      return {
        title: title || "Code Block",
        subtitle: subtitle ? `Language: ${subtitle}` : "Code",
        media: () => "💻",
      };
    },
  },
});
