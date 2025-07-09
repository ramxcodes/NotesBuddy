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
import NoteHeader from "@/components/note/NoteHeader";
import { Separator } from "@/components/ui/separator";
import GreetUser from "@/components/note/GreetUser";
import NotesFontControl from "@/components/note/NotesFontControl";

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
      {/* Font Control - Fixed position on the left */}
      <NotesFontControl />

      <div className="note-content-wrapper flex pt-10">
        <div className="flex flex-1 justify-center">
          <div className="w-full max-w-3xl px-4 sm:px-6">
            <NoteHeader note={note} />
            <Separator className="my-8" />
            <GreetUser
              name={session.user.name}
              image={session.user.image || null}
              email={session.user.email}
            />
            {markdown ? (
              <article className="prose prose-lg dark:prose-invert prose-headings:scroll-mt-8">
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
        <aside className="fixed top-40 right-0 mr-10 hidden w-[16.5rem] flex-shrink-0 pr-2 lg:block">
          <TableOfContent headings={note.headings} />
        </aside>
      </div>
    </div>
  );
}
