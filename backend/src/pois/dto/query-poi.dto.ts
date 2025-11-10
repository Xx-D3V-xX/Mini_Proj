import { z } from 'zod';

export const poiQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  tags: z.string().optional(),
  rating_min: z.coerce.number().min(0).max(5).optional(),
  price_level: z.coerce.number().min(0).max(4).optional(),
  bbox: z.string().optional(),
  sort: z.string().optional(),
  page: z.coerce.number().min(1).optional(),
});

export type PoiQueryDto = z.infer<typeof poiQuerySchema>;
