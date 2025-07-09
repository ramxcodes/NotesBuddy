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
    <div className="relative w-full">
      <div className="flex pt-10">
        {/* Main content - centered */}
        <div className="flex flex-1 justify-center">
          <div className="w-full max-w-3xl px-4 sm:px-6">
            <header className="mb-8">
              <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                {note.title}
              </h1>
              <p className="mb-3 text-lg text-gray-600 dark:text-gray-400">
                {note.syllabus}
              </p>
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 dark:bg-gray-800">
                  {note.university}
                </span>
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 dark:bg-gray-800">
                  {note.degree}
                </span>
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 dark:bg-gray-800">
                  {note.year}
                </span>
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 dark:bg-gray-800">
                  {note.semester}
                </span>
              </div>
            </header>

            {markdown ? (
              <article className="prose prose-lg dark:prose-invert prose-headings:scroll-mt-8 max-w-none">
                <PortableText
                  value={note.content || []}
                  components={myPortableTextComponents}
                />
              </article>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No content available
              </p>
            )}
          </div>
        </div>

        {/* Table of Contents - positioned to the right with minimal spacing */}
        <aside className="hidden w-[16.5rem] fixed top-40 right-0 flex-shrink-0 pr-2 mr-10 lg:block">
          <TableOfContent headings={note.headings} />
        </aside>
      </div>
    </div>
  );
}
