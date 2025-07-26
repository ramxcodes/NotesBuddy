import AdminFlashcardController from "@/components/admin/flashcard/AdminFlashcardController";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flashcard Management",
  description: "Admin panel for managing flashcard sets and cards",
};

export default function FlashcardsPage() {
  return (
    <div className="space-y-8">
      <AdminFlashcardController />
    </div>
  );
}
