import { authClient } from "@/lib/auth/auth-client";
import { sendErrorMessageToTelegram } from "@/lib/telegram/action";

export const telegramLogger = async (errorMessage: string, error?: unknown) => {
  try {
    // getting user session
    const { data: session } = await authClient.getSession();

    // setting the userInfo

    let userInfo: { userId: string; userName: string; email: string } | null =
      null;

    if (session?.user?.id) {
      userInfo = {
        email: session.user.email,
        userId: session.user.id,
        userName: session.user.name,
      };
    }

    // getting user screen size
    let screenWidth: number | null = null;
    let screenHeight: number | null = null;
    let userBrowserName: string | null = null;

    if (typeof window !== "undefined") {
      screenWidth = window.innerWidth;
      screenHeight = window.innerHeight;

      // setting the user browser name
      userBrowserName = getUserBrowserName(navigator.userAgent);
    }

    // setting the current timestamp
    const timestamp = new Date().toISOString();

    // constructing error details
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

// get user browser name
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
