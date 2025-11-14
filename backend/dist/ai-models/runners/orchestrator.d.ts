export type HandleAIRequestInput = {
    user?: {
        id?: string;
    };
    sessionId?: string;
    message: string;
    params?: Record<string, unknown>;
};
export type HandleAIResponse = {
    session_id: string;
    reply_markdown: string;
    poi_ids_referenced: string[];
};
export declare function handleAIRequest(input: HandleAIRequestInput): Promise<HandleAIResponse>;
