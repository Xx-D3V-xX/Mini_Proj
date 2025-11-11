import { z } from 'zod';

const bboxRegex = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?,-?\d+(\.\d+)?,-?\d+(\.\d+)?$/;

export const searchPoiSchema = z.object({
  q: z.string().max(160).optional(),
  category: z.string().max(64).optional(),
  tag: z.string().max(64).optional(),
  min_rating: z.coerce.number().min(0).max(5).optional(),
  max_price: z.coerce.number().min(0).max(4).optional(),
  bbox: z
    .string()
    .regex(bboxRegex, 'bbox format must be minLat,minLon,maxLat,maxLon')
    .optional(),
  open_at: z.string().optional(),
  weekday: z
    .enum(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'])
    .optional(),
  limit: z.coerce.number().min(1).max(50).optional(),
});

export type SearchPoiDto = z.infer<typeof searchPoiSchema>;
