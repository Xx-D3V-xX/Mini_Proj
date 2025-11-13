import { z } from 'zod';
declare const itineraryItemSchema: z.ZodObject<{
    poi_id: z.ZodString;
    start_time: z.ZodOptional<z.ZodString>;
    end_time: z.ZodOptional<z.ZodString>;
    note: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const createItinerarySchema: z.ZodObject<{
    user_id: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    date: z.ZodOptional<z.ZodString>;
    mode: z.ZodOptional<z.ZodEnum<{
        MIXED: "MIXED";
        WALK: "WALK";
        METRO: "METRO";
        BUS: "BUS";
        CAR: "CAR";
        AUTO: "AUTO";
    }>>;
    items: z.ZodArray<z.ZodObject<{
        poi_id: z.ZodString;
        start_time: z.ZodOptional<z.ZodString>;
        end_time: z.ZodOptional<z.ZodString>;
        note: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type CreateItineraryDto = z.infer<typeof createItinerarySchema>;
export type CreateItineraryItemDto = z.infer<typeof itineraryItemSchema>;
export {};
