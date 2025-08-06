"use server";

import { getFilteredNotes } from "@/dal/note/helper";

interface LoadMoreNotesParams {
  search?: string;
  university?: string;
  degree?: string;
  year?: string;
  semester?: string;
  subject?: string;
  premium?: string;
  type?: string;
  lastTitle?: string;
  lastId?: string;
}

export async function loadMoreNotesAction(params: LoadMoreNotesParams) {
  const filters = {
    search: params.search,
    university: params.university === "all" ? undefined : params.university,
    degree: params.degree === "all" ? undefined : params.degree,
    year: params.year === "all" ? undefined : params.year,
    semester: params.semester === "all" ? undefined : params.semester,
    subject: params.subject === "all" ? undefined : params.subject,
    premium: params.premium === "all" ? undefined : params.premium,
    type: params.type === "all" ? undefined : params.type || "notes",
  };

  const cursor = {
    lastTitle: params.lastTitle,
    lastId: params.lastId,
  };

  return await getFilteredNotes(filters, cursor);
}
