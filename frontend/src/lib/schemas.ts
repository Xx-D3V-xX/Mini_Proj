import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = loginSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const generateItinerarySchema = z
  .object({
    mood: z.string().min(3, "Select a mood"),
    start_location: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    }),
    time_window: z.object({
      start: z.string().regex(timeRegex, "Use HH:MM format"),
      end: z.string().regex(timeRegex, "Use HH:MM format"),
    }),
    poi_ids: z.array(z.string()).optional(),
  })
  .refine(
    (value) => {
      const [startHour, startMinute] = value.time_window.start.split(":").map(Number);
      const [endHour, endMinute] = value.time_window.end.split(":").map(Number);
      const startTotal = startHour * 60 + startMinute;
      const endTotal = endHour * 60 + endMinute;
      return endTotal > startTotal;
    },
    { message: "End time must be after start time", path: ["time_window", "end"] },
  );

export type GenerateItineraryInput = z.infer<typeof generateItinerarySchema>;
