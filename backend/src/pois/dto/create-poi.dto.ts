import { z } from 'zod';

const hoursSchema = z.record(z.string(), z.array(z.tuple([z.string(), z.string()])));

export const createPoiSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  category: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  rating: z.number().min(0).max(5).optional(),
  price_level: z.number().min(0).max(4).optional(),
  tags: z.array(z.string()).default([]),
  opening_hours: hoursSchema.optional(),
  image_url: z.string().url().optional().or(z.literal('')),
});

export type CreatePoiDto = z.infer<typeof createPoiSchema>;
