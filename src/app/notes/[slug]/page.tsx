import { client } from "@/sanity/lib/client";
import { NOTE_BY_SLUG_QUERY } from "@/sanity/lib/queries";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import TableOfContent from "@/components/note/table-of-content";
import { myPortableTextComponents } from "@/components/note/custom-components/portableText-components";

export default async function NotePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  const note = await client.fetch(NOTE_BY_SLUG_QUERY, { slug });
  if (!note) {
    notFound();
  }

  const markdown = note.content || "";

  return (
    <div className="max-w-6xl mx-auto mt-10">
      <h1 className="text-3xl font-bold">{note.title}</h1>
      <p className="text-sm text-gray-500">{note.syllabus}</p>
      <p className="text-sm text-gray-500">{note.university}</p>
      <TableOfContent headings={note.headings} />
      {markdown ? (
        <article className="prose prose-gray max-w-none my-8">
          <PortableText
            value={note.content || []}
            components={myPortableTextComponents}
          />
        </article>
      ) : (
        <p className="text-sm text-gray-500 mt-8">No content available</p>
      )}
    </div>
  );
}
