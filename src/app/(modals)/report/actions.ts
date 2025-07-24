"use server";

import { getSession } from "@/lib/db/user";
import { createReport } from "@/dal/user/report/query";
import type { CreateReportInput } from "@/dal/user/report/types";

export async function submitReport(formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id) {
    return {
      success: false,
      error: "Unauthorized",
    };
  }

  const report = formData.get("report") as string;
  const url = formData.get("url") as string;

  if (!report || !url) {
    return {
      success: false,
      error: "Missing report or url.",
    };
  }

  const input: CreateReportInput = {
    userId: session.user.id,
    report,
    url,
  };

  try {
    await createReport(input);
    return { success: true };
  } catch {
    return {
      success: false,
      error: "Failed to submit report. Please try again.",
    };
  }
}
