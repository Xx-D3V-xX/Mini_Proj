import { z } from 'zod';

export const locationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

export const timeWindowSchema = z.object({
  start: z.string(),
  end: z.string(),
});

export const generateItinerarySchema = z.object({
  mood: z.string().min(3),
  start_location: locationSchema,
  time_window: timeWindowSchema,
  poi_ids: z.array(z.string()).optional(),
});

export type GenerateItineraryDto = z.infer<typeof generateItinerarySchema>;
