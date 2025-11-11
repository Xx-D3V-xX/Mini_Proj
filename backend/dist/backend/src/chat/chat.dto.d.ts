import { z } from 'zod';
export declare const chatRequestSchema: z.ZodObject<{
    session_id: z.ZodOptional<z.ZodString>;
    user_id: z.ZodOptional<z.ZodString>;
    message: z.ZodString;
}, z.core.$strip>;
export type ChatRequestDto = z.infer<typeof chatRequestSchema>;
