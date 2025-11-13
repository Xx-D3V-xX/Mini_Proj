export interface User {
  id: string;
  email: string;
  name?: string | null;
  role: 'ADMIN' | 'USER';
  preferences?: Record<string, unknown> | null;
}

export interface PoiCategory {
  slug: string;
  name: string;
}

export interface PoiTag {
  slug: string;
  name: string;
}

export interface PoiOpeningHour {
  day: string;
  open_time: string;
  close_time: string;
}

export interface Poi {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  address?: string | null;
  locality?: string | null;
  city?: string | null;
  latitude: number;
  longitude: number;
  rating?: number | null;
  price_level?: number | null;
  ticket_price_inr?: number | null;
  best_time_of_day?: string | null;
  indoor_outdoor?: string | null;
  time_spent_min?: number | null;
  website_url?: string | null;
  phone?: string | null;
  image_url?: string | null;
  categories: PoiCategory[];
  tags: PoiTag[];
  opening_hours: PoiOpeningHour[];
  reason?: string;
}

export interface SearchResult {
  id: string;
  name: string;
  lat: number;
  lon: number;
  rating?: number | null;
  price_level?: number | null;
  distance_km?: number | null;
  open_now?: boolean;
  image_url?: string | null;
}

export interface ItineraryItem {
  poi_id: string;
  name?: string; // optional for Profile rendering
  start_time: string | null;
  end_time: string | null;
  distance_km?: number | null; // convenience alias for leg_distance_km
  leg_distance_km?: number | null;
  leg_time_min?: number | null;
  note?: string | null;
}

export interface Itinerary {
  id: string;
  title: string;
  items: ItineraryItem[];
  total_distance_km?: number;
  total_time_min?: number;
  date?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface TravelHistoryEntry {
  id: string;
  name: string;
  visitedAt: string;
  notes?: string;
  imageUrl?: string | null;
  rating?: number | null;
  tag?: string;
}
