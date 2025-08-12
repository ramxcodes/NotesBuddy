import { createParser } from "eventsource-parser";
import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";
import { generateSystemPrompt } from "@/utils/ai-system-prompt";
import { getUserId } from "@/lib/db/user";
import { decryptApiKey } from "@/lib/api-server";

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 30;

function sanitizeInput(input: string): string {
  const injectionPatterns = [
    /ignore previous instructions/gi,
    /system prompt/gi,
    /you are now/gi,
    /act as/gi,
    /pretend to be/gi,
    /ignore all previous/gi,
    /forget everything/gi,
    /new instructions/gi,
    /override/gi,
    /bypass/gi,
    /hack/gi,
    /exploit/gi,
    /inject/gi,
    /prompt injection/gi,
    /system message/gi,
    /role play/gi,
    /character/gi,
    /persona/gi,
    /behave as/gi,
    /respond as/gi,
  ];

  let sanitized = input;

  injectionPatterns.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, "[REDACTED]");
  });

  sanitized = sanitized.trim().replace(/\s+/g, " ");

  if (sanitized.length > 2000) {
    sanitized = sanitized.substring(0, 2000);
  }

  return sanitized;
}

const chatSchema = z.object({
  message: z.string().min(1).max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "model"]),
        parts: z.array(z.object({ text: z.string() })),
      }),
    )
    .optional()
    .default([]),
  model: z
    .enum([
      "gemini-2.5-pro",
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite",
      "gemini-2.0-flash",
    ])
    .default("gemini-2.0-flash"),
  apiKey: z.string().min(1),
  isEncrypted: z.boolean().default(true),
  university: z.string(),
  degree: z.string(),
  year: z.string(),
  semester: z.string(),
  subject: z.string(),
});

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const cfConnectingIP = request.headers.get("cf-connecting-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  return "unknown";
}

function checkRateLimit(clientIP: string): {
  allowed: boolean;
  remaining: number;
} {
  const now = Date.now();
  const clientData = rateLimitStore.get(clientIP);

  if (!clientData || now > clientData.resetTime) {
    rateLimitStore.set(clientIP, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
  }

  if (clientData.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  clientData.count++;
  rateLimitStore.set(clientIP, clientData);

  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX_REQUESTS - clientData.count,
  };
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(clientIP);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Too many requests. Please try again later.",
          retryAfter: RATE_LIMIT_WINDOW / 1000,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": RATE_LIMIT_MAX_REQUESTS.toString(),
            "X-RateLimit-Remaining": rateLimit.remaining.toString(),
            "X-RateLimit-Reset": (Date.now() + RATE_LIMIT_WINDOW).toString(),
          },
        },
      );
    }

    const body = await request.json();

    const validatedData = chatSchema.parse(body);

    // Decrypt the API key
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "User not authenticated", retryable: false },
        { status: 401 },
      );
    }

    let actualApiKey: string;
    try {
      actualApiKey = decryptApiKey(validatedData.apiKey, userId);
    } catch {
      return NextResponse.json(
        {
          error: "Invalid or corrupted API key. Please re-enter your API key.",
          retryable: false,
        },
        { status: 400 },
      );
    }

    const sanitizedMessage = sanitizeInput(validatedData.message);

    const sanitizedParams = {
      university: sanitizeInput(validatedData.university),
      degree: sanitizeInput(validatedData.degree),
      year: sanitizeInput(validatedData.year),
      semester: sanitizeInput(validatedData.semester),
      subject: sanitizeInput(validatedData.subject),
    };

    const systemPrompt = await generateSystemPrompt(sanitizedParams);

    const requestBody = {
      contents: [
        {
          parts: [{ text: systemPrompt }],
          role: "user",
        },
        {
          parts: [
            {
              text: "I understand. I will act as your academic assistant based on the provided syllabus and notes content.",
            },
          ],
          role: "model",
        },
        ...validatedData.history.map((msg) => ({
          ...msg,
          parts: msg.parts.map((part) => ({
            ...part,
            text: msg.role === "user" ? sanitizeInput(part.text) : part.text,
          })),
        })),
        {
          parts: [{ text: sanitizedMessage }],
          role: "user",
        },
      ],
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      },
    };

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${validatedData.model}:streamGenerateContent?alt=sse&key=${actualApiKey}`;

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);

      let errorDetails;
      try {
        errorDetails = JSON.parse(errorText);
      } catch {
        errorDetails = { error: { message: errorText } };
      }

      if (response.status === 400) {
        return NextResponse.json(
          {
            error:
              "Invalid API key or request. Please check your Gemini API key.",
            details: errorDetails,
          },
          { status: 400 },
        );
      }

      if (response.status === 403) {
        return NextResponse.json(
          {
            error:
              "API key access denied. Please check your API key permissions.",
            details: errorDetails,
          },
          { status: 403 },
        );
      }

      if (response.status === 429) {
        return NextResponse.json(
          {
            error:
              "Rate limit exceeded. Please wait a moment before trying again.",
            details: errorDetails,
          },
          { status: 429 },
        );
      }

      if (response.status === 503) {
        const errorMessage =
          errorDetails?.error?.message || "Service unavailable";

        if (errorMessage.includes("overloaded")) {
          return NextResponse.json(
            {
              error:
                "The AI model is currently overloaded. Please try again in a few moments or consider switching to a different model.",
              details: errorDetails,
              retryable: true,
            },
            { status: 503 },
          );
        }

        return NextResponse.json(
          {
            error:
              "The AI service is temporarily unavailable. Please try again later.",
            details: errorDetails,
            retryable: true,
          },
          { status: 503 },
        );
      }

      return NextResponse.json(
        {
          error: `AI service error (${response.status}). Please try again.`,
          details: errorDetails,
          retryable: response.status >= 500,
        },
        { status: response.status },
      );
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const parser = createParser({
            onEvent: (event) => {
              try {
                if (event.data === "[DONE]") {
                  controller.enqueue(
                    encoder.encode('data: {"done": true}\n\n'),
                  );
                  controller.close();
                  return;
                }

                const data = JSON.parse(event.data);
                const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                  const sseData = `data: ${JSON.stringify({ text })}\n\n`;
                  controller.enqueue(encoder.encode(sseData));
                }
              } catch (parseError) {
                console.error("Parse error:", parseError);
              }
            },
          });

          if (!response.body) {
            throw new Error("No response body");
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            parser.feed(decoder.decode(value));
          }

          controller.enqueue(encoder.encode('data: {"done": true}\n\n'));
          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          const errorMessage =
            error instanceof Error ? error.message : "Stream error occurred";
          const errorData = `data: ${JSON.stringify({
            error: errorMessage,
            retryable: true,
          })}\n\n`;
          controller.enqueue(encoder.encode(errorData));
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "X-RateLimit-Limit": RATE_LIMIT_MAX_REQUESTS.toString(),
        "X-RateLimit-Remaining": rateLimit.remaining.toString(),
      },
    });
  } catch (error) {
    console.error("Chat API Error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: error.errors,
        },
        { status: 400 },
      );
    }

    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return NextResponse.json(
          {
            error:
              "Invalid API key. Please check your Gemini API key and try again.",
            retryable: false,
          },
          { status: 401 },
        );
      }

      if (error.message.includes("rate limit")) {
        return NextResponse.json(
          {
            error: "Rate limit exceeded. Please wait before trying again.",
            retryable: true,
          },
          { status: 429 },
        );
      }

      if (error.message.includes("overloaded")) {
        return NextResponse.json(
          {
            error:
              "The AI model is currently overloaded. Please try again in a few moments or switch to a different model.",
            retryable: true,
          },
          { status: 503 },
        );
      }
    }

    return NextResponse.json(
      {
        error: "Internal server error. Please try again.",
        retryable: true,
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
