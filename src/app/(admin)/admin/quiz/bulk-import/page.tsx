import { Metadata } from "next";
import BulkQuizImport from "@/components/admin/quiz/BulkQuizImport";

export const metadata: Metadata = {
  title: "Bulk Quiz Import | Notes Buddy Admin",
  description: "Import multiple quiz sets from JSON data",
};

export default function BulkQuizImportPage() {
  return <BulkQuizImport />;
}
