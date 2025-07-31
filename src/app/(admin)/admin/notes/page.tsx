import AdminNotesController from "@/components/admin/notes/AdminNotesController";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notes Management",
  description: "Admin panel for managing notes content",
};

export default function NotesPage() {
  return (
    <div className="space-y-8">
      <AdminNotesController />
    </div>
  );
}
