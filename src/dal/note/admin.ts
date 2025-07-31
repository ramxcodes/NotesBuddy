import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";
import { cache } from "react";
import { type Note } from "@/sanity/types";

// Create admin client with write token
const adminClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_EDITOR_TOKEN,
});

export interface NotesListParams {
  page?: number;
  search?: string;
  university?: string;
  degree?: string;
  year?: string;
  semester?: string;
  subject?: string;
  sortBy?: "title" | "createdAt" | "university" | "subject";
  sortOrder?: "asc" | "desc";
}

export interface NotesListResponse {
  notes: NoteListItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface NoteListItem {
  _id: string;
  _createdAt: string;
  _updatedAt?: string;
  title: string;
  slug: {
    current: string;
  };
  university: string;
  degree: string;
  year: string;
  semester: string;
  subject: string;
  isPremium: boolean;
  tier?: string;
}

export interface NoteDetails {
  _id: string;
  _createdAt: string;
  _updatedAt?: string;
  title: string;
  syllabus?: string;
  slug: {
    current: string;
  };
  university: string;
  degree: string;
  year: string;
  semester: string;
  subject: string;
  isPremium: boolean;
  tier?: string;
  content: NonNullable<Note["content"]>;
}

// Get all notes for admin with pagination and filtering
export const getNotesForAdmin = async ({
  page = 1,
  search,
  university,
  degree,
  year,
  semester,
  subject,
  sortBy = "createdAt",
  sortOrder = "desc",
}: NotesListParams): Promise<NotesListResponse> => {
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  // Build filter conditions
  const conditions = ['_type == "note"'];
  const params: Record<string, string> = {};

  if (search) {
    conditions.push(
      '(title match $search + "*" || subject match $search + "*")',
    );
    params.search = search;
  }

  if (university) {
    conditions.push("university == $university");
    params.university = university;
  }

  if (degree) {
    conditions.push("degree == $degree");
    params.degree = degree;
  }

  if (year) {
    conditions.push("year == $year");
    params.year = year;
  }

  if (semester) {
    conditions.push("semester == $semester");
    params.semester = semester;
  }

  if (subject) {
    conditions.push("subject == $subject");
    params.subject = subject;
  }

  const whereClause = conditions.join(" && ");

  // Build sort clause
  const sortField = sortBy === "createdAt" ? "_createdAt" : sortBy;
  const sortClause = `${sortField} ${sortOrder}`;

  // Get notes with pagination
  const notesQuery = `*[${whereClause}] | order(${sortClause}) [${offset}...${offset + pageSize}] {
    _id,
    _createdAt,
    _updatedAt,
    title,
    slug,
    university,
    degree,
    year,
    semester,
    subject,
    isPremium,
    tier
  }`;

  // Get total count
  const countQuery = `count(*[${whereClause}])`;

  try {
    const [notes, totalCount] = await Promise.all([
      adminClient.fetch(notesQuery, params),
      adminClient.fetch(countQuery, params),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      notes,
      totalCount,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  } catch (error) {
    console.error("Error fetching notes for admin:", error);
    throw new Error("Failed to fetch notes");
  }
};

// Get note details by ID for editing
export const getNoteForEdit = async (
  id: string,
): Promise<NoteDetails | null> => {
  const query = `*[_type == "note" && _id == $id][0] {
    _id,
    _createdAt,
    _updatedAt,
    title,
    syllabus,
    slug,
    university,
    degree,
    year,
    semester,
    subject,
    isPremium,
    tier,
    content
  }`;

  try {
    const note = await adminClient.fetch(query, { id });
    return note || null;
  } catch (error) {
    console.error("Error fetching note for edit:", error);
    throw new Error("Failed to fetch note details");
  }
};

// Update note content
export const updateNote = async (
  id: string,
  data: Partial<NoteDetails>,
): Promise<NoteDetails> => {
  try {
    await adminClient
      .patch(id)
      .set({
        ...data,
        _updatedAt: new Date().toISOString(),
      })
      .commit();

    // Fetch the updated note to return
    const updatedNote = await getNoteForEdit(id);
    if (!updatedNote) {
      throw new Error("Note not found after update");
    }

    return updatedNote;
  } catch (error) {
    console.error("Error updating note:", error);
    throw new Error("Failed to update note");
  }
};

// Get unique values for filters
export const getNotesFilterOptions = cache(async () => {
  const query = `{
    "universities": array::unique(*[_type == "note" && defined(university)].university) | order(@),
    "degrees": array::unique(*[_type == "note" && defined(degree)].degree) | order(@),
    "years": array::unique(*[_type == "note" && defined(year)].year) | order(@),
    "semesters": array::unique(*[_type == "note" && defined(semester)].semester) | order(@),
    "subjects": array::unique(*[_type == "note" && defined(subject)].subject) | order(@)
  }`;

  try {
    return await adminClient.fetch(query);
  } catch (error) {
    console.error("Error fetching filter options:", error);
    throw new Error("Failed to fetch filter options");
  }
});
