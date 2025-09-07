"use server";

interface ErrorLogData {
  errorMessage: string;
  timestamp: string;
  userInfo: {
    userId: string;
    userName: string;
    email: string;
  } | null;
  browserName: string | null;
  screenWidth: number | null;
  screenHeight: number | null;
  errorDetails: string;
}

const formatErrorMessage = (data: ErrorLogData): string => {
  const {
    errorMessage,
    timestamp,
    userInfo,
    browserName,
    screenWidth,
    screenHeight,
    errorDetails,
  } = data;

  const maxErrorDetailsLength = 3000;
  const truncatedErrorDetails =
    errorDetails.length > maxErrorDetailsLength
      ? `${errorDetails.substring(0, maxErrorDetailsLength)}...\n\n[Message truncated due to length]`
      : errorDetails;

  const message = `
🚨 Error Alert
──────────────
📋 Message: ${errorMessage}
⏰ Timestamp: ${timestamp}
🆔 UserId: ${userInfo?.userId || "Not authenticated"}
👤 UserName: ${userInfo?.userName || "Not authenticated"}
✉️ UserEmail: ${userInfo?.email || "Not authenticated"}
🌐 Browser: ${browserName || "Unknown/Server-side"}
📱 Screen: ${screenWidth && screenHeight ? `${screenWidth}x${screenHeight}px` : "Unknown/Server-side"}
──────────────
🔍 Error Details:
${truncatedErrorDetails}
  `.trim();

  if (message.length > 4090) {
    const truncateAt = 4000;
    return `${message.substring(0, truncateAt)}...\n\n[Message truncated]`;
  }

  return message;
};

export const sendErrorMessageToTelegram = async (logData: ErrorLogData) => {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_ERROR_LOGS_CHANNEL;

  if (!botToken || !channelId) {
    console.log("Missing telegram configuration.");
    console.log("Error:", logData.errorMessage);
    console.log("Details:", logData.errorDetails);
    return false;
  }

  const message = formatErrorMessage(logData);

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: channelId,
          text: message,
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Telegram API error:", errorText);
      if (typeof process !== "undefined" && process.stderr) {
        process.stderr.write(
          `[${new Date().toISOString()}] Telegram API Error: ${errorText}\nOriginal message: ${message.substring(0, 500)}...\n`,
        );
      }
      return false;
    }

    return true;
  } catch (error) {
    const errorString =
      error instanceof Error
        ? `${error.name}: ${error.message}`
        : String(error);
    console.error("Telegram send failed:", errorString);
    if (typeof process !== "undefined" && process.stderr) {
      process.stderr.write(
        `[${new Date().toISOString()}] Telegram Send Failed: ${errorString}\nOriginal message: ${message.substring(0, 500)}...\n`,
      );
    }
    return false;
  }
};
