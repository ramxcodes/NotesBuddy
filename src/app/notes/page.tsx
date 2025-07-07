import Search from "@/components/note/Search";
import { client } from "@/sanity/lib/client";
import { NOTES_QUERY } from "@/sanity/lib/queries";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notes",
  description: "Notes page",
};

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string | undefined }>;
}) {
  const query = (await searchParams).query;
  const params = { search: query || null };

  const notes = await client.fetch(NOTES_QUERY, params);
  return (
    <div className="mx-auto mt-10 flex max-w-6xl flex-col gap-4">
      <h1 className="text-3xl font-bold">Notes</h1>
      <Search query={query || ""} />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {notes.map((note) => (
          <div
            key={note._id}
            className="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg dark:bg-gray-800"
          >
            <h2 className="mb-4 text-xl font-semibold">{note.title}</h2>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <p className="flex items-center gap-2">
                <span className="font-medium">Syllabus:</span>
                {note.syllabus}
              </p>
              <p className="flex items-center gap-2">
                <span className="font-medium">University:</span>
                {note.university}
              </p>
              <p className="flex items-center gap-2">
                <span className="font-medium">Degree:</span>
                {note.degree}
              </p>
              <p className="flex items-center gap-2">
                <span className="font-medium">Year:</span>
                {note.year}
              </p>
              <p className="flex items-center gap-2">
                <span className="font-medium">Semester:</span>
                {note.semester}
              </p>
              <p className="flex items-center gap-2">
                <span className="font-medium">Subject:</span>
                {note.subject}
              </p>
              {note.slug?.current && (
                <p className="flex items-center gap-2">
                  <span className="font-medium">Slug: {note.slug.current}</span>
                  <Link href={`/notes/${note.slug.current}`}>Visit Notes</Link>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
