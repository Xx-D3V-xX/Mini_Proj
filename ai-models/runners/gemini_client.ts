import { setTimeout as delay } from 'timers/promises';

export type GeminiRequest = {
  systemPrompt: string;
  userPrompt: string;
  outputSchema?: object;
  maxOutputTokens?: number;
  temperature?: number;
};

export class GeminiClient {
  constructor(private readonly apiKey: string, private readonly model: string) {}

  async generate(payload: GeminiRequest) {
    const body = {
      contents: [
        { role: 'system', parts: [{ text: payload.systemPrompt }] },
        { role: 'user', parts: [{ text: payload.userPrompt }] },
      ],
      generationConfig: {
        temperature: payload.temperature ?? 0.2,
        maxOutputTokens: payload.maxOutputTokens ?? 512,
        responseMimeType: payload.outputSchema ? 'application/json' : 'text/plain',
      },
      responseSchema: payload.outputSchema ?? undefined,
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const res = await fetch(`${url}?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
        return text;
      }
      await delay(200 * (attempt + 1));
    }
    throw new Error('Gemini call failed after retries');
  }
}
