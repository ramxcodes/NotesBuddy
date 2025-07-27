import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";
import { createChat } from "@/dal/ai/chat";
import { University, Degree, Year, Semester } from "@prisma/client";

const createChatSchema = z.object({
  userId: z.string().min(1),
  university: z.nativeEnum(University),
  degree: z.nativeEnum(Degree),
  year: z.nativeEnum(Year),
  semester: z.nativeEnum(Semester),
  subject: z.string().min(1),
  name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createChatSchema.parse(body);

    const chat = await createChat(validatedData);

    return NextResponse.json(chat);
  } catch (error) {
    console.error("Error creating chat:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create chat" },
      { status: 500 },
    );
  }
}
