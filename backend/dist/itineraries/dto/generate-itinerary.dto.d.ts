import { z } from 'zod';
export declare const locationSchema: z.ZodObject<{
    lat: z.ZodNumber;
    lng: z.ZodNumber;
}, z.core.$strip>;
export declare const timeWindowSchema: z.ZodObject<{
    start: z.ZodString;
    end: z.ZodString;
}, z.core.$strip>;
export declare const generateItinerarySchema: z.ZodObject<{
    mood: z.ZodString;
    start_location: z.ZodObject<{
        lat: z.ZodNumber;
        lng: z.ZodNumber;
    }, z.core.$strip>;
    time_window: z.ZodObject<{
        start: z.ZodString;
        end: z.ZodString;
    }, z.core.$strip>;
    poi_ids: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export type GenerateItineraryDto = z.infer<typeof generateItinerarySchema>;
