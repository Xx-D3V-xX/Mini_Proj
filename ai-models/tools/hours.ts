import { OpeningHour, Weekday } from '@prisma/client';

export function isOpenAt(hours: OpeningHour[], weekday: Weekday, time: string) {
  return hours.some((row) => row.day === weekday && row.open_time <= time && row.close_time >= time);
}

export function normalizeOpenAt(value?: string) {
  if (!value) return null;
  const hasZone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(value);
  const normalized = hasZone ? value : `${value}+05:30`;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return null;
  const weekday = date
    .toLocaleDateString('en-US', { weekday: 'short', timeZone: 'Asia/Kolkata' })
    .slice(0, 3)
    .toUpperCase() as Weekday;
  const time = date
    .toLocaleTimeString('en-GB', { hour12: false, timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
  return { weekday, time };
}
