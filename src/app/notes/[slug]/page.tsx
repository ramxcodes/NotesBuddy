import { notFound, redirect } from "next/navigation";
import { PortableText } from "@portabletext/react";
import TableOfContent from "@/components/note/TableOfContent";
import { myPortableTextComponents } from "@/components/note/custom-components/PortableTextComponent";
import { checkUserBlockedStatus, getSession } from "@/lib/db/user";
import type { Metadata } from "next";
import { getNoteBySlug } from "@/dal/note/helper";
import Container from "@/components/core/Container";
import { checkUserAccessToContent } from "@/dal/premium/query";
import { PremiumTier } from "@prisma/client";
import AccessDenied from "@/components/note/AccessDenied";

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
  const slug = (await params).slug;
  const [isBlocked, note] = await Promise.all([
    checkUserBlockedStatus(session.user.id),
    getNoteBySlug(slug),
  ]);

  if (isBlocked) {
    redirect("/blocked");
  }

  if (!note) {
    notFound();
  }

  if (note.isPremium) {
    const accessStatus = await checkUserAccessToContent(
      session.user.id,
      note.tier as PremiumTier,
      note.university,
      note.degree,
      note.year,
      note.semester,
    );
    // If user cannot access content, show access denied page
    if (!accessStatus.canAccess) {
      return (
        <Container>
          <AccessDenied accessStatus={accessStatus} />
        </Container>
      );
    }
  }

  const markdown = note.content || "";

  return (
    <Container>
      <div className="mx-auto mt-10 max-w-6xl">
        <h1 className="text-3xl font-bold">{note.title}</h1>
        <p className="text-sm text-gray-500">{note.syllabus}</p>
        <div className="flex items-center gap-2 mt-2">
          <p className="text-sm text-gray-500">{note.university}</p>
          <p className="text-sm text-gray-500">{note.degree}</p>
          <p className="text-sm text-gray-500">{note.year}</p>
          <p className="text-sm text-gray-500">{note.semester}</p>
        </div>
        <TableOfContent headings={note.headings} />
        {markdown ? (
          <article className="prose dark:prose-invert my-8 max-w-none">
            <PortableText
              value={note.content || []}
              components={myPortableTextComponents}
            />
          </article>
        ) : (
          <p className="mt-8 text-sm text-gray-500">No content available</p>
        )}
      </div>
    </Container>
  );
}
