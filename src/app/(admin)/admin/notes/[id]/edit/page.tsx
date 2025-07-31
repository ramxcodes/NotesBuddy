import AdminNoteEditor from "@/components/admin/notes/AdminNoteEditor";
import { getNoteDetailsAction } from "@/components/admin/actions/admin-notes";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const note = await getNoteDetailsAction(id);

  return {
    title: note ? `Edit: ${note.title}` : "Edit Note",
    description: "Edit note content and details",
  };
}

export default async function EditNotePage({ params }: Props) {
  const { id } = await params;
  const note = await getNoteDetailsAction(id);

  if (!note) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <AdminNoteEditor note={note} />
    </div>
  );
}
