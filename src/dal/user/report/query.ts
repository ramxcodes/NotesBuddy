
import prisma from "@/lib/db/prisma";
import type { CreateReportInput, Report } from "./types";

export async function createReport(input: CreateReportInput): Promise<Report> {
  const report = await prisma.report.create({
    data: {
      userId: input.userId,
      report: input.report,
      url: input.url,
    },
  });
  return report;
}

export async function getReportsByUserId(userId: string): Promise<Report[]> {
  return prisma.report.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}
