import { z } from 'zod';

export const updatePreferencesSchema = z.object({
  preferences: z.record(z.string(), z.any()).optional(),
});

export type UpdatePreferencesDto = z.infer<typeof updatePreferencesSchema>;
