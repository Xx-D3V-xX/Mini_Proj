"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiClient = void 0;
const promises_1 = require("timers/promises");
class GeminiClient {
    constructor(apiKey, model) {
        this.apiKey = apiKey;
        this.model = model;
    }
    async generate(payload) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        const body = {
            contents: [
                { role: 'system', parts: [{ text: payload.systemPrompt }] },
                { role: 'user', parts: [{ text: payload.userPrompt }] },
            ],
            generationConfig: {
                temperature: (_a = payload.temperature) !== null && _a !== void 0 ? _a : 0.2,
                maxOutputTokens: (_b = payload.maxOutputTokens) !== null && _b !== void 0 ? _b : 512,
                responseMimeType: payload.outputSchema ? 'application/json' : 'text/plain',
            },
            responseSchema: (_c = payload.outputSchema) !== null && _c !== void 0 ? _c : undefined,
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
                const text = (_j = (_h = (_g = (_f = (_e = (_d = data === null || data === void 0 ? void 0 : data.candidates) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.content) === null || _f === void 0 ? void 0 : _f.parts) === null || _g === void 0 ? void 0 : _g[0]) === null || _h === void 0 ? void 0 : _h.text) !== null && _j !== void 0 ? _j : '';
                return text;
            }
            await (0, promises_1.setTimeout)(200 * (attempt + 1));
        }
        throw new Error('Gemini call failed after retries');
    }
}
exports.GeminiClient = GeminiClient;
//# sourceMappingURL=gemini_client.js.map