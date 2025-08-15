import AdminNotesImport from "@/components/admin/notes/AdminNotesImport";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Import Notes",
  description: "Import notes from JSON file to Sanity CMS",
};

export default function ImportNotesPage() {
  return (
    <div className="space-y-8" data-lenis-prevent>
      <AdminNotesImport />
    </div>
  );
}
