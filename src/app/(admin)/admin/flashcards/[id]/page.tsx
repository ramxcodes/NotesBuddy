import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getFlashcardSetById } from "@/dal/flashcard/query";
import EditFlashcardForm from "@/components/admin/flashcard/EditFlashcardForm";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const flashcardSet = await getFlashcardSetById(id);

  if (!flashcardSet) {
    return {
      title: "Flashcard Not Found",
    };
  }

  return {
    title: `Edit ${flashcardSet.title}`,
    description: `Edit flashcard set: ${flashcardSet.title}`,
  };
}

export default async function AdminEditFlashcardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const flashcardSet = await getFlashcardSetById(id);

  if (!flashcardSet) {
    notFound();
  }

  return <EditFlashcardForm flashcardSet={flashcardSet} />;
}
