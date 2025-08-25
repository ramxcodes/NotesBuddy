import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { telegramLogger } from "@/utils/telegram-logger";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { walletBalance: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      walletBalance: user.walletBalance.toNumber(),
    });
  } catch (error) {
    console.error("Error fetching wallet balance:", error);
    await telegramLogger.sendError(
      error instanceof Error ? error : new Error(String(error)),
      "User Wallet Balance",
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
