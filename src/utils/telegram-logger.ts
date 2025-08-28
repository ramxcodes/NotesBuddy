import { authClient } from "@/lib/auth/auth-client";
import { sendErrorMessageToTelegram } from "@/lib/telegram/action";

export const telegramLogger = async (errorMessage: string, error?: unknown) => {
  try {
    // getting user session
    const { data: session } = await authClient.getSession();

    // setting the userId
    const userId: string | null = session?.user?.id ?? null;

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
      userId,
      browserName: userBrowserName,
      screenWidth,
      screenHeight,
      errorDetails,
    };

    await sendErrorMessageToTelegram(logData);
  } catch (loggingError) {
    console.error("Failed to send error to Telegram:", loggingError);
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
