export interface User {
  id: string;
  email: string;
  name?: string | null;
  role: 'ADMIN' | 'USER';
  preferences?: Record<string, unknown> | null;
}

export interface Poi {
  id: string;
  name: string;
  description: string;
  category: string;
  latitude: number;
  longitude: number;
  rating?: number | null;
  price_level?: number | null;
  tags?: string[];
  image_url?: string | null;
  reason?: string;
}

export interface ItineraryItem {
  poi_id: string;
  name: string;
  lat: number;
  lng: number;
  start_time: string;
  end_time: string;
  travel_minutes: number;
  distance_km: number;
}

export interface Itinerary {
  id: string;
  title: string;
  items: ItineraryItem[];
  total_distance_km?: number;
  total_time_min?: number;
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
