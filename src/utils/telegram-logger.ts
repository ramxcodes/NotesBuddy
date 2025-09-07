import { authClient } from "@/lib/auth/auth-client";
import { sendErrorMessageToTelegram } from "@/lib/telegram/action";

export const telegramLogger = async (errorMessage: string, error?: unknown) => {
  try {
    const { data: session } = await authClient.getSession();

    let userInfo: { userId: string; userName: string; email: string } | null =
      null;

    if (session?.user?.id) {
      userInfo = {
        email: session.user.email,
        userId: session.user.id,
        userName: session.user.name,
      };
    }

    let screenWidth: number | null = null;
    let screenHeight: number | null = null;
    let userBrowserName: string | null = null;

    if (typeof window !== "undefined") {
      screenWidth = window.innerWidth;
      screenHeight = window.innerHeight;

      userBrowserName = getUserBrowserName(navigator.userAgent);
    }

    const timestamp = new Date().toISOString();

    const errorDetails = error
      ? error instanceof Error
        ? `${error.name}: ${error.message}\nStack: ${error.stack || "No stack trace"}`
        : String(error)
      : "No error object provided";

    const logData = {
      errorMessage,
      timestamp,
      userInfo,
      browserName: userBrowserName,
      screenWidth,
      screenHeight,
      errorDetails,
    };

    await sendErrorMessageToTelegram(logData);
  } catch (loggingError) {
    if (
      typeof process !== "undefined" &&
      process.stderr &&
      typeof process.stderr.write === "function"
    ) {
      process.stderr.write(
        "Failed to send error to Telegram: " + String(loggingError) + "\n",
      );
    }
  }
};

export const logDeviceLimitExceeded = async (userInfo: {
  userId: string;
  email: string;
  name: string;
}) => {
  try {
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const formattedTime = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    });

    const message = `🚨 DEVICE LIMIT EXCEEDED

👤 User Information
• Name: ${userInfo.name}
• Email: ${userInfo.email}
• ID: ${userInfo.userId}

📅 When
• Date: ${formattedDate}
• Time: ${formattedTime}

⚠️ Action Taken
User session has been terminated and they have been signed out automatically.`;

    const logData = {
      errorMessage: message,
      timestamp: now.toISOString(),
      userInfo: {
        userId: userInfo.userId,
        userName: userInfo.name,
        email: userInfo.email,
      },
      browserName: null,
      screenWidth: null,
      screenHeight: null,
      errorDetails: "Device limit exceeded - automatic sign out",
    };

    await sendErrorMessageToTelegram(logData);
  } catch (error) {
    console.warn("Error sending device limit message:", error);
  }
};

const getUserBrowserName = (userAgent: string): string => {
  if (userAgent.includes("Firefox")) {
    return "Mozilla Firefox";
  } else if (userAgent.includes("SamsungBrowser")) {
    return "Samsung Internet";
  } else if (userAgent.includes("Opera") || userAgent.includes("OPR")) {
    return "Opera";
  } else if (userAgent.includes("Edge")) {
    return "Microsoft Edge (Legacy)";
  } else if (userAgent.includes("Edg")) {
    return "Microsoft Edge (Chromium)";
  } else if (userAgent.includes("Chrome")) {
    return "Google Chrome or Chromium";
  } else if (userAgent.includes("Safari")) {
    return "Apple Safari";
  }
  return "unknown";
};
