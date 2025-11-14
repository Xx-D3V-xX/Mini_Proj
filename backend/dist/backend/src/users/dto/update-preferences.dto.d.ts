import { z } from 'zod';
export declare const updatePreferencesSchema: z.ZodObject<{
    preferences: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, z.core.$strip>;
export type UpdatePreferencesDto = z.infer<typeof updatePreferencesSchema>;
