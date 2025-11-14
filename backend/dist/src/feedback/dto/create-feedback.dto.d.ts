import { z } from 'zod';
export declare const createFeedbackSchema: z.ZodObject<{
    user_id: z.ZodString;
    poi_id: z.ZodString;
    signal: z.ZodEnum<{
        LIKE: "LIKE";
        DISLIKE: "DISLIKE";
        SAVE: "SAVE";
        REPORT: "REPORT";
        NOT_RELEVANT: "NOT_RELEVANT";
    }>;
    reason: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateFeedbackDto = z.infer<typeof createFeedbackSchema>;
