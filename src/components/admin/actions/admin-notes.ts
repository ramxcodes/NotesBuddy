"use server";

import { adminStatus } from "@/lib/db/user";
import { revalidateTag } from "next/cache";
import {
  getNotesForAdmin,
  getNoteForEdit,
  updateNote,
  getNotesFilterOptions,
  type NotesListParams,
  type NotesListResponse,
  type NoteDetails,
} from "@/dal/note/admin";
import { createNoteDocument } from "@/lib/notes-parser";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";
import { type Note } from "@/sanity/types";

type PortableTextContent = NonNullable<Note["content"]>;

// Get all notes for admin
export async function getNotesAction(
  params: NotesListParams,
): Promise<NotesListResponse | null> {
  const isAdmin = await adminStatus();

  if (!isAdmin) {
    return null;
  }

  try {
    const result = await getNotesForAdmin(params);
    return result;
  } catch (error) {
    console.error("Error fetching notes:", error);
    return null;
  }
}

// Get note details for editing
export async function getNoteDetailsAction(
  id: string,
): Promise<NoteDetails | null> {
  const isAdmin = await adminStatus();

  if (!isAdmin) {
    return null;
  }

  try {
    const result = await getNoteForEdit(id);
    return result;
  } catch (error) {
    console.error("Error fetching note details:", error);
    return null;
  }
}

// Update note
export async function updateNoteAction(
  id: string,
  data: Partial<NoteDetails>,
): Promise<{ success: boolean; note?: NoteDetails; error?: string }> {
  const isAdmin = await adminStatus();

  if (!isAdmin) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const updatedNote = await updateNote(id, data);

    // Revalidate cache
    revalidateTag("notes");

    return { success: true, note: updatedNote };
  } catch (error) {
    console.error("Error updating note:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update note",
    };
  }
}

// Get filter options
export async function getNotesFilterOptionsAction(): Promise<{
  universities: string[];
  degrees: string[];
  years: string[];
  semesters: string[];
  subjects: string[];
} | null> {
  const isAdmin = await adminStatus();

  if (!isAdmin) {
    return null;
  }

  try {
    const result = await getNotesFilterOptions();
    return result;
  } catch (error) {
    console.error("Error fetching filter options:", error);
    return null;
  }
}

// Create admin client with write token
const adminClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_EDITOR_TOKEN,
});

// Import notes action
export async function importNotesAction({
  parsedNote,
  manualFields,
}: {
  parsedNote: {
    topic: string;
    subject: string;
    content: PortableTextContent;
    originalId: string;
    timestamp: string;
  };
  manualFields: {
    title?: string;
    subject?: string;
    syllabus?: string;
    university: string;
    degree: string;
    year: string;
    semester: string;
    type: string;
    isPremium: boolean;
    tier?: string;
  };
}): Promise<{ success: boolean; error?: string; noteId?: string }> {
  const isAdmin = await adminStatus();

  if (!isAdmin) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Create note document
    const noteDocument = createNoteDocument({
      parsedNote,
      manualFields,
    });

    // Create document in Sanity
    const result = await adminClient.create({
      ...noteDocument,
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
    });

    // Revalidate cache
    revalidateTag("notes");

    return { success: true, noteId: result._id };
  } catch (error) {
    console.error("Error importing note:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to import note",
    };
  }
}
