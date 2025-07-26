import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import { getFlashcardSetForUser } from "@/dal/flashcard/user-query";
import { checkFlashcardSetAccessAction } from "@/components/flashcard/actions/flashcard-access";
import FlashcardViewer from "@/components/flashcard/FlashcardViewer";
import FlashcardAccessDenied from "@/components/flashcard/FlashcardAccessDenied";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const flashcardSet = await getFlashcardSetForUser(id);

  if (!flashcardSet) {
    return {
      title: "Flashcard Not Found",
    };
  }

  return {
    title: flashcardSet.title,
    description:
      flashcardSet.description || `Flashcard set for ${flashcardSet.subject}`,
  };
}

export default async function FlashcardViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Check access using the action
  const accessResult = await checkFlashcardSetAccessAction(id);

  if (accessResult.reason === "NOT_AUTHENTICATED") {
    redirect("/auth/signin");
  }

  if (!accessResult.canAccess) {
    if (!accessResult.flashcardSet) {
      notFound();
    }

    return (
      <FlashcardAccessDenied
        flashcardSet={accessResult.flashcardSet}
        accessResult={accessResult}
      />
    );
  }

  if (!accessResult.flashcardSet) {
    notFound();
  }

  return <FlashcardViewer flashcardSet={accessResult.flashcardSet} />;
}
