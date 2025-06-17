import { client } from "@/sanity/lib/client";
import { NOTES_QUERY } from "@/sanity/lib/queries";
import { Note } from "@/types/note";

export default async function NotesPage() {
  const notes = await client.fetch(NOTES_QUERY);
  console.log(JSON.stringify(notes, null, 2));
  return (
    <div>
      <h1>Notes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map((note: Note) => (
          <div key={note._id}>
            <h2>{note.title}</h2>
            <p>{note.syllabus}</p>
            <p>{note.views}</p>
            <p>{note.slug.current}</p>
            <p>{note.university}</p>
            <p>{note.degree}</p>
            <p>{note.year}</p>
            <p>{note.semester}</p>
            <p>{note.subject}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
