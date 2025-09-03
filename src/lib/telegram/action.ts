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

  return `
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
${errorDetails}
  `.trim();
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
          parse_mode: "HTML",
        }),
      },
    );

    if (!response.ok) {
      console.error("Telegram API error:", await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error("Telegram send failed:", error);
    return false;
  }
};
