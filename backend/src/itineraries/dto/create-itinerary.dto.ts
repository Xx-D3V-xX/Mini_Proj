import { z } from 'zod';

const itineraryItemSchema = z.object({
  poi_id: z.string().uuid(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  note: z.string().max(240).optional(),
});

export const createItinerarySchema = z.object({
  user_id: z.string().uuid().optional(),
  title: z.string().min(1).max(160),
  date: z.string().optional(),
  mode: z.enum(['WALK', 'METRO', 'BUS', 'CAR', 'AUTO', 'MIXED']).optional(),
  items: z.array(itineraryItemSchema).min(1),
});

export type CreateItineraryDto = z.infer<typeof createItinerarySchema>;
export type CreateItineraryItemDto = z.infer<typeof itineraryItemSchema>;
