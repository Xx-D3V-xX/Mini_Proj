export type GeminiRequest = {
    systemPrompt: string;
    userPrompt: string;
    outputSchema?: object;
    maxOutputTokens?: number;
    temperature?: number;
};
export declare class GeminiClient {
    private readonly apiKey;
    private readonly model;
    constructor(apiKey: string, model: string);
    generate(payload: GeminiRequest): Promise<any>;
}
