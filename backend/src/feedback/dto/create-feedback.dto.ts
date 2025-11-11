import { z } from 'zod';

export const createFeedbackSchema = z.object({
  user_id: z.string().uuid(),
  poi_id: z.string().uuid(),
  signal: z.enum(['LIKE', 'DISLIKE', 'SAVE', 'REPORT', 'NOT_RELEVANT']),
  reason: z.string().max(280).optional(),
});

export type CreateFeedbackDto = z.infer<typeof createFeedbackSchema>;
