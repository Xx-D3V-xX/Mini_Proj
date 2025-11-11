import { z } from 'zod';

export const chatRequestSchema = z.object({
  session_id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  message: z.string().min(1),
});

export type ChatRequestDto = z.infer<typeof chatRequestSchema>;
