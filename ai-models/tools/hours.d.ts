import { OpeningHour, Weekday } from '@prisma/client';
export declare function isOpenAt(hours: OpeningHour[], weekday: Weekday, time: string): boolean;
export declare function normalizeOpenAt(value?: string): {
    weekday: import("@prisma/client/default").$Enums.Weekday;
    time: string;
};
