import prisma from "@/lib/db/prisma";
import type { CreateReportInput, Report } from "./types";
import telegramBot, {
  type ReportNotificationData,
} from "@/lib/telegram/telegramBot";

export async function createReport(input: CreateReportInput): Promise<Report> {
  const report = await prisma.report.create({
    data: {
      userId: input.userId,
      report: input.report,
      url: input.url,
    },
    include: {
      user: true,
    },
  });

  // Send Telegram notification for the report
  try {
    const notificationData: ReportNotificationData = {
      userName: report.user.name || "Unknown User",
      email: report.user.email,
      reportText: report.report,
      url: report.url,
      route: extractRouteFromUrl(report.url),
    };

    await telegramBot.sendReportNotification(notificationData);
  } catch {}

  // Return the report without the user relation to match the original return type
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user, ...reportData } = report;
  return reportData as Report;
}

// Helper function to extract route from URL
function extractRouteFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname + urlObj.search;
  } catch {
    // If URL parsing fails, return the full URL
    return url;
  }
}

export async function getReportsByUserId(userId: string): Promise<Report[]> {
  return prisma.report.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}
