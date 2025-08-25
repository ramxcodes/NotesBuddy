export class TelegramLogger {
  private botToken: string;
  private channelId: string;

  constructor(botToken?: string, channelId?: string) {
    this.botToken = botToken || process.env.TELEGRAM_BOT_TOKEN || "";
    this.channelId = channelId || process.env.TELEGRAM_REPORTS_CHANNEL || "";
  }

  async sendMessage(message: string): Promise<boolean> {
    if (!this.botToken || !this.channelId) {
      console.error("Telegram configuration missing");
      return false;
    }

    try {
      const response = await fetch(
        `https://api.telegram.org/bot${this.botToken}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: this.channelId,
            text: message,
          }),
        },
      );

      return response.ok;
    } catch (error) {
      console.error("Telegram send failed:", error);
      return false;
    }
  }

  async sendError(error: Error, context?: string): Promise<boolean> {
    const message = context
      ? `🚨 Error in ${context}: ${error.message}`
      : `🚨 Error: ${error.message}`;

    return this.sendMessage(message);
  }
}

export const telegramLogger = new TelegramLogger();
