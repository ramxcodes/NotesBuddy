import { Metadata } from "next";
import BulkFlashcardImport from "@/components/admin/flashcard/BulkFlashcardImport";

export const metadata: Metadata = {
  title: "Bulk Import Flashcards - Admin",
  description: "Import flashcards in bulk from JSON files",
};

export default function BulkImportFlashcardsPage() {
  return <BulkFlashcardImport />;
}
