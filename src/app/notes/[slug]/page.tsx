import { notFound, redirect } from "next/navigation";
import TableOfContent from "@/components/note/TableOfContent";
import { PortableTextRenderer } from "@/components/note/PortableTextRenderer";
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
import NotesScrollProcess from "@/components/note/NotesScrollProcess";
import ScrollToTop from "@/components/core/ScrollToTop";
import NextContent from "@/components/note/NextContent";
import PiracyProtection from "@/components/core/PiracyProtection";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug;
  const note = await getNoteBySlug(slug);

  if (!note) {
    return {
      title: "Note Not Found",
      description: "The requested note could not be found.",
    };
  }

  const title = note.title || "Study Note";
  const description =
    note.syllabus ||
    `Comprehensive study notes for ${note.subject || "your studies"}. Access detailed content and enhance your learning experience with Notes Buddy.`;
  const baseUrl = "https://notesbuddy.in";

  // Filter out null values for keywords and tags
  const keywordsList = [
    note.subject,
    note.university,
    note.degree,
    note.year,
    note.semester,
    "study notes",
    "education",
    "learning",
  ].filter((item): item is string => Boolean(item));

  const tagsList = [
    note.subject,
    note.university,
    note.degree,
    note.year,
    note.semester,
  ].filter((item): item is string => Boolean(item));

  return {
    title,
    description,
    keywords: keywordsList,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/notes/${slug}`,
      siteName: "Notes Buddy",
      locale: "en_US",
      type: "article",
      authors: ["Notes Buddy Team"],
      section: note.subject || "Education",
      tags: tagsList,
      images: [
        {
          url: `${baseUrl}/notes/${slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: "@notesbuddy",
      creator: "@notesbuddy",
      images: [`${baseUrl}/notes/${slug}/opengraph-image`],
    },
    alternates: {
      canonical: `${baseUrl}/notes/${slug}`,
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
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

  return (
    <div className="relative w-full">
      <PiracyProtection isPremium={note.isPremium || false} />

      <ScrollToTop />
      {/* Font Control - Fixed position on the left */}
      <NotesFontControl />

      {/* Table of Contents - Toggle component */}
      <TableOfContent headings={note.headings} />

      {/* Scroll Progress - Fixed position on the right */}
      <NotesScrollProcess />

      <div className="note-content-wrapper pt-10">
        <div className="flex justify-center">
          <div className="w-full max-w-4xl px-4 sm:px-6 lg:px-8">
            <NoteHeader note={note} />
            <Separator className="my-8" />
            <GreetUser
              name={session.user.name}
              image={session.user.image || null}
              email={session.user.email}
              content={note.content || undefined}
            />
            {note.content && note.content.length > 0 ? (
              <article className="prose prose-lg dark:prose-invert prose-headings:scroll-mt-8 mx-auto">
                <PortableTextRenderer value={note.content} />
              </article>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No content available
              </p>
            )}

            {/* Next Content Section */}
            {note.university &&
              note.degree &&
              note.year &&
              note.semester &&
              note.subject &&
              note.slug?.current && (
                <NextContent
                  university={note.university}
                  degree={note.degree}
                  year={note.year}
                  semester={note.semester}
                  subject={note.subject}
                  currentSlug={note.slug.current}
                />
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
