import CreateFlashcardForm from "@/components/admin/flashcard/CreateFlashcardForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Flashcard Set",
  description: "Create a new flashcard set with multiple cards",
};

export default function CreateFlashcardPage() {
  return (
    <div className="space-y-8">
      <CreateFlashcardForm />
    </div>
  );
}
