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
}

interface ReportNotificationData {
  userName: string;
  email: string;
  reportText: string;
  url: string;
  route: string;
}

class TelegramBot {
  private botToken: string;
  private paymentChannelId: string;
  private reportsChannelId: string;
  private initError: string | null = null;

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || "";
    this.paymentChannelId = process.env.TELEGRAM_PAYMENT_CHANNEL || "";
    this.reportsChannelId = process.env.TELEGRAM_REPORTS_CHANNEL || "";

    if (!this.botToken) {
      this.initError = "TELEGRAM_BOT_TOKEN is not set";
    } else if (!this.paymentChannelId) {
      this.initError = "TELEGRAM_PAYMENT_CHANNEL is not set";
    } else if (!this.reportsChannelId) {
      this.initError = "TELEGRAM_REPORTS_CHANNEL is not set";
    }
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

    const emoji = data.isSuccess ? "✅" : "❌";
    const status = data.isSuccess ? "CONFIRMED" : "FAILED";

    let messageText = `${emoji} <b>Payment ${status}</b>\n\n`;
    messageText += `<b>User Details:</b>\n`;
    messageText += `• Name: ${data.userName}\n`;
    messageText += `• Email: ${data.email}\n`;
    if (data.phone) {
      messageText += `• Phone: ${data.phone}\n`;
    }
    messageText += `\n<b>Payment Details:</b>\n`;
    messageText += `• Amount: ₹${data.paymentAmount}\n`;
    messageText += `• Tier: ${data.tier}\n`;
    messageText += `\n<b>Academic Details:</b>\n`;
    messageText += `• University: ${data.university}\n`;
    messageText += `• Degree: ${data.degree}\n`;
    messageText += `• Year: ${data.year}\n`;
    messageText += `• Semester: ${data.semester}\n`;

    if (!data.isSuccess && data.failureReason) {
      messageText += `\n<b>Failure Reason:</b>\n${data.failureReason}`;
    }

    messageText += `\n\n<i>Timestamp: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</i>`;

    return this.sendMessage({
      chat_id: this.paymentChannelId,
      text: messageText,
      parse_mode: "HTML",
    });
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
}

const telegramBot = new TelegramBot();

export default telegramBot;
export type { PaymentNotificationData, ReportNotificationData };
