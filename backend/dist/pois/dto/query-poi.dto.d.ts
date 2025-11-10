import { z } from 'zod';
export declare const poiQuerySchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodString>;
    rating_min: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    price_level: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    bbox: z.ZodOptional<z.ZodString>;
    sort: z.ZodOptional<z.ZodString>;
    page: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export type PoiQueryDto = z.infer<typeof poiQuerySchema>;
