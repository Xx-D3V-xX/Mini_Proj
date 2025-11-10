import { z } from 'zod';
export declare const createPoiSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    category: z.ZodString;
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
    rating: z.ZodOptional<z.ZodNumber>;
    price_level: z.ZodOptional<z.ZodNumber>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
    opening_hours: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodTuple<[z.ZodString, z.ZodString], null>>>>;
    image_url: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
}, z.core.$strip>;
export type CreatePoiDto = z.infer<typeof createPoiSchema>;
