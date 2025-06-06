export interface OpenAIConfig {
  apiKey: string;
}

export interface ContentGenerationOptions {
  input: string;
  temperature?: number;
  maxTokens?: number;
}

export class OpenAIService {
  private apiKey: string;

  constructor(config: OpenAIConfig) {
    this.apiKey = config.apiKey;
  }

  async generateLinkedInContent(options: ContentGenerationOptions): Promise<string> {
    const { input, temperature = 0.8, maxTokens = 500 } = options;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: 'system',
            content: `You are Bhagya Sharma's personal LinkedIn Agent.
Bhagya Sharma's tone is witty, creative, warm, thoughtful.
Your tasks:
- Write LinkedIn posts based on Bhagya's ideas.
- Write thoughtful, engaging replies to others' posts.
- Write warm and professional DM replies.
Adapt to context. Output only the text that should be posted.
Style examples:
- Embrace curiosity in every scroll.
- Sometimes a smile is the best comment.
- Let's build connections that matter.
- Your next breakthrough insight might be hiding in your LinkedIn feed.
Keep posts authentic, engaging, and true to Bhagya's voice.`
          },
          {
            role: 'user',
            content: input
          }
        ],
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async analyzeSentiment(text: string): Promise<{ rating: number; confidence: number }> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: 'system',
            content: 'You are a sentiment analysis expert. Analyze the sentiment of the text and provide a rating from 1 to 5 stars and a confidence score between 0 and 1. Respond with JSON in this format: { "rating": number, "confidence": number }'
          },
          {
            role: 'user',
            content: text
          }
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    
    return {
      rating: Math.max(1, Math.min(5, Math.round(result.rating))),
      confidence: Math.max(0, Math.min(1, result.confidence)),
    };
  }
}
