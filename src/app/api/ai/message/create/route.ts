import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";
import { createMessage } from "@/dal/ai/chat";
import { MessageRole } from "@prisma/client";
import { telegramLogger } from "@/utils/telegram-logger";

const createMessageSchema = z.object({
  chatId: z.string().min(1),
  role: z.nativeEnum(MessageRole),
  content: z.string().min(1),
  model: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createMessageSchema.parse(body);

    const message = await createMessage(validatedData);

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error creating message:", error);
    await telegramLogger.sendError(
      error instanceof Error ? error : new Error(String(error)),
      "AI Message Create",
    );

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 },
    );
  }
}
