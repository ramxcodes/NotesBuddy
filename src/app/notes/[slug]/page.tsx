import { notFound, redirect } from "next/navigation";
import { PortableText } from "@portabletext/react";
import TableOfContent from "@/components/note/table-of-content";
import { myPortableTextComponents } from "@/components/note/custom-components/portableText-components";
import { checkUserBlockedStatus, getSession } from "@/lib/db/user";
import type { Metadata } from "next";
import { getNoteBySlug } from "@/dal/note/helper";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug;
  const note = await getNoteBySlug(slug);

  return {
    title: note?.title || "Note",
    description: note?.syllabus || "Note",
  };
}

export default async function NotePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/sign-in");
  }

  const isBlocked = await checkUserBlockedStatus(session.user.id);
  if (isBlocked) {
    redirect("/blocked");
  }

  const slug = (await params).slug;
  const note = await getNoteBySlug(slug);
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
