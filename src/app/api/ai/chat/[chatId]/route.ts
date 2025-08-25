import { NextRequest, NextResponse } from "next/server";
import { getChatById } from "@/dal/ai/chat";
import { telegramLogger } from "@/utils/telegram-logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> },
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    const { chatId } = await params;
    const chat = await getChatById(chatId, userId);

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json(chat);
  } catch (error) {
    console.error("Error fetching chat:", error);
    await telegramLogger.sendError(
      error instanceof Error ? error : new Error(String(error)),
      "AI Chat Fetch",
    );
    return NextResponse.json(
      { error: "Failed to fetch chat" },
      { status: 500 },
    );
  }
}
