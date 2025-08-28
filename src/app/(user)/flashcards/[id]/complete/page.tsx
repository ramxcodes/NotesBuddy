import { notFound } from "next/navigation";
import FlashcardCompletePage from "@/components/flashcard/FlashcardCompletePage";
import { getFlashcardSetByIdAction } from "../../actions";
import { telegramLogger } from "@/utils/telegram-logger";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function FlashcardCompletePageRoute({
  params,
}: PageProps) {
  const { id } = await params;

  return <FlashcardCompletePageContent id={id} />;
}

async function FlashcardCompletePageContent({ id }: { id: string }) {
  try {
    const flashcardSet = await getFlashcardSetByIdAction(id);

    if (!flashcardSet) {
      notFound();
    }

    return <FlashcardCompletePage flashcardSet={flashcardSet} />;
  } catch (error) {
    await telegramLogger("Error loading flashcard set:", error);
    notFound();
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;

  try {
    const flashcardSet = await getFlashcardSetByIdAction(id);

    if (!flashcardSet) {
      return {
        title: "Flashcard Set Not Found",
        description: "The requested flashcard set could not be found.",
      };
    }

    return {
      title: `Study Complete - ${flashcardSet.title}`,
      description: `You've completed studying ${flashcardSet.title} flashcard set. Review your progress and continue learning.`,
    };
  } catch {
    return {
      title: "Flashcard Set Not Found",
      description: "The requested flashcard set could not be found.",
    };
  }
}
