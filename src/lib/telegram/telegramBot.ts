interface TelegramMessage {
  chat_id: string;
  text: string;
  parse_mode?: "HTML" | "Markdown";
}

interface PaymentNotificationData {
  userName: string;
  email: string;
  phone?: string;
  paymentAmount: string;
  tier: string;
  university: string;
  degree: string;
  year: string;
  semester: string;
  isSuccess: boolean;
  failureReason?: string;
  paymentId?: string;
  orderId?: string;
}

interface ReportNotificationData {
  userName: string;
  email: string;
  reportText: string;
  url: string;
  route: string;
}
class NotificationCache {
  private sentNotifications = new Map<
    string,
    { timestamp: number; status: string }
  >();
  private readonly TTL = 24 * 60 * 60 * 1000;

  private generateKey(
    email: string,
    paymentId?: string,
    orderId?: string,
    status?: string,
  ): string {
    const baseKey = `${email}_${paymentId || orderId || "unknown"}`;
    return status ? `${baseKey}_${status}` : baseKey;
  }

  hasBeenSent(
    email: string,
    paymentId?: string,
    orderId?: string,
    status?: string,
  ): boolean {
    const key = this.generateKey(email, paymentId, orderId, status);
    const cached = this.sentNotifications.get(key);

    if (!cached) return false;

    const isExpired = Date.now() - cached.timestamp > this.TTL;
    if (isExpired) {
      this.sentNotifications.delete(key);
      return false;
    }

    return true;
  }

  // Mark notification as sent
  markAsSent(
    email: string,
    paymentId?: string,
    orderId?: string,
    status?: string,
  ): void {
    const key = this.generateKey(email, paymentId, orderId, status);
    this.sentNotifications.set(key, {
      timestamp: Date.now(),
      status: status || "unknown",
    });
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.sentNotifications.entries()) {
      if (now - value.timestamp > this.TTL) {
        this.sentNotifications.delete(key);
      }
    }
  }

  getCacheStats(): {
    size: number;
    entries: Array<{ key: string; timestamp: Date; status: string }>;
  } {
    const entries: Array<{ key: string; timestamp: Date; status: string }> = [];

    for (const [key, value] of this.sentNotifications.entries()) {
      entries.push({
        key,
        timestamp: new Date(value.timestamp),
        status: value.status,
      });
    }

    return {
      size: entries.length,
      entries,
    };
  }
}

class TelegramBot {
  private botToken: string;
  private paymentChannelId: string;
  private reportsChannelId: string;
  private initError: string | null = null;
  private notificationCache: NotificationCache;

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || "";
    this.paymentChannelId = process.env.TELEGRAM_PAYMENT_CHANNEL || "";
    this.reportsChannelId = process.env.TELEGRAM_REPORTS_CHANNEL || "";
    this.notificationCache = new NotificationCache();

    if (!this.botToken) {
      this.initError = "TELEGRAM_BOT_TOKEN is not set";
    } else if (!this.paymentChannelId) {
      this.initError = "TELEGRAM_PAYMENT_CHANNEL is not set";
    } else if (!this.reportsChannelId) {
      this.initError = "TELEGRAM_REPORTS_CHANNEL is not set";
    }
    setInterval(
      () => {
        this.notificationCache.cleanup();
      },
      6 * 60 * 60 * 1000,
    );
  }

  private async sendMessage(message: TelegramMessage): Promise<boolean> {
    if (this.initError) {
      throw new Error(this.initError);
    }

    try {
      const response = await fetch(
        `https://api.telegram.org/bot${this.botToken}/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(message),
        },
      );

      if (!response.ok) {
        const errorData = await response.text();

        throw new Error(`Telegram API error: ${response.status} ${errorData}`);
      }

      return true;
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error("Unknown error sending Telegram message");
    }
  }

  async sendPaymentNotification(
    data: PaymentNotificationData,
  ): Promise<boolean> {
    if (!this.paymentChannelId) {
      throw new Error("Payment channel ID is not configured");
    }

    // Check if this notification was already sent
    const status = data.isSuccess ? "success" : "failed";
    const hasBeenSent = this.notificationCache.hasBeenSent(
      data.email,
      data.paymentId,
      data.orderId,
      status,
    );

    if (hasBeenSent) {
      console.log(
        `✅ Duplicate payment notification prevented for ${data.email} - ${status} - PaymentID: ${data.paymentId || "N/A"} - OrderID: ${data.orderId || "N/A"}`,
      );
      return true; // Return true to indicate "success" (notification not needed)
    }

    const emoji = data.isSuccess ? "✅" : "❌";
    const statusText = data.isSuccess ? "CONFIRMED" : "FAILED";

    let messageText = `${emoji} <b>Payment ${statusText}</b>\n\n`;
    messageText += `<b>User Details:</b>\n`;
    messageText += `• Name: ${data.userName}\n`;
    messageText += `• Email: ${data.email}\n`;
    if (data.phone) {
      messageText += `• Phone: ${data.phone}\n`;
    }
    messageText += `\n<b>Payment Details:</b>\n`;
    messageText += `• Amount: ₹${data.paymentAmount}\n`;
    messageText += `• Tier: ${data.tier}\n`;
    if (data.paymentId) {
      messageText += `• Payment ID: ${data.paymentId}\n`;
    }
    if (data.orderId) {
      messageText += `• Order ID: ${data.orderId}\n`;
    }
    messageText += `\n<b>Academic Details:</b>\n`;
    messageText += `• University: ${data.university}\n`;
    messageText += `• Degree: ${data.degree}\n`;
    messageText += `• Year: ${data.year}\n`;
    messageText += `• Semester: ${data.semester}\n`;

    if (!data.isSuccess && data.failureReason) {
      messageText += `\n<b>Failure Reason:</b>\n${data.failureReason}`;
    }

    messageText += `\n\n<i>Timestamp: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</i>`;

    try {
      const result = await this.sendMessage({
        chat_id: this.paymentChannelId,
        text: messageText,
        parse_mode: "HTML",
      });

      // Mark as sent only if the message was successfully sent
      if (result) {
        this.notificationCache.markAsSent(
          data.email,
          data.paymentId,
          data.orderId,
          status,
        );
        console.log(
          `✅ Payment notification sent and cached for ${data.email} - ${status} - PaymentID: ${data.paymentId || "N/A"} - OrderID: ${data.orderId || "N/A"}`,
        );
      }

      return result;
    } catch (error) {
      console.error("Failed to send payment notification:", error);
      throw error;
    }
  }

  async sendReportNotification(data: ReportNotificationData): Promise<boolean> {
    if (!this.reportsChannelId) {
      throw new Error("Reports channel ID is not configured");
    }

    let messageText = `⚠️ <b>New Report Submitted</b>\n\n`;
    messageText += `<b>User Details:</b>\n`;
    messageText += `• Name: ${data.userName}\n`;
    messageText += `• Email: ${data.email}\n`;
    messageText += `\n<b>Report Details:</b>\n`;
    messageText += `• URL: ${data.url}\n`;
    messageText += `• Route: ${data.route}\n`;
    messageText += `• Complaint: ${data.reportText}\n`;
    messageText += `\n<i>Timestamp: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</i>`;

    return this.sendMessage({
      chat_id: this.reportsChannelId,
      text: messageText,
      parse_mode: "HTML",
    });
  }

  // Debug method to manually clear notification cache
  clearNotificationCache(): void {
    this.notificationCache = new NotificationCache();
    console.log("Payment notification cache cleared");
  }

  // Debug method to get cache stats
  getCacheStats(): {
    size: number;
    entries: Array<{ key: string; timestamp: Date; status: string }>;
  } {
    return this.notificationCache.getCacheStats();
  }
}

const telegramBot = new TelegramBot();

export default telegramBot;
export type { PaymentNotificationData, ReportNotificationData };
