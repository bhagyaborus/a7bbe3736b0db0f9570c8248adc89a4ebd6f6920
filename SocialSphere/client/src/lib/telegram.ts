export interface TelegramConfig {
  botToken: string;
  chatId: string;
}

export class TelegramAPI {
  private botToken: string;
  private chatId: string;

  constructor(config: TelegramConfig) {
    this.botToken = config.botToken;
    this.chatId = config.chatId;
  }

  async sendMessage(text: string): Promise<Response> {
    const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
    
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: this.chatId,
        text,
      }),
    });
  }

  async sendMessageWithButtons(text: string, buttons: Array<{text: string, callback_data: string}>): Promise<Response> {
    const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
    
    const replyMarkup = {
      inline_keyboard: [buttons]
    };
    
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: this.chatId,
        text,
        reply_markup: replyMarkup,
      }),
    });
  }

  async setWebhook(webhookUrl: string): Promise<Response> {
    const url = `https://api.telegram.org/bot${this.botToken}/setWebhook`;
    
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: webhookUrl,
      }),
    });
  }
}
