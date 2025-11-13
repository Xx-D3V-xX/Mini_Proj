import { z } from 'zod';
export declare const searchPoiSchema: z.ZodObject<{
    q: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodString>;
    tag: z.ZodOptional<z.ZodString>;
    min_rating: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    max_price: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    bbox: z.ZodOptional<z.ZodString>;
    open_at: z.ZodOptional<z.ZodString>;
    weekday: z.ZodOptional<z.ZodEnum<{
        MON: "MON";
        TUE: "TUE";
        WED: "WED";
        THU: "THU";
        FRI: "FRI";
        SAT: "SAT";
        SUN: "SUN";
    }>>;
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export type SearchPoiDto = z.infer<typeof searchPoiSchema>;
