import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";

import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { SearchResultCard } from "@/components/SearchResultCard";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { apiRequest } from "@/lib/queryClient";
import type { SearchResult } from "@/lib/types";

const CATEGORY_OPTIONS = [
  { label: "All Categories", value: "all" },
  { label: "Landmark", value: "landmark" },
  { label: "Viewpoint", value: "viewpoint" },
  { label: "Museum", value: "museum" },
  { label: "Nature", value: "nature" },
  { label: "Market", value: "market" },
  { label: "Temple", value: "temple" },
  { label: "Park", value: "park" },
  { label: "Food & Drinks", value: "food-drinks" },
];

const RATING_OPTIONS = [
  { label: "Any rating", value: "all" },
  { label: "4★ & up", value: "4" },
  { label: "4.5★ & up", value: "4.5" },
];

const PRICE_OPTIONS = [
  { label: "Any Budget", value: "3" },
  { label: "Free", value: "0" },
  { label: "Budget ($)", value: "1" },
  { label: "Mid-range ($$)", value: "2" },
];

const MOOD_OPTIONS = [
  { label: "Cultural immersion", value: "culture", tag: "heritage" },
  { label: "Foodie crawl", value: "foodie", tag: "streetfood" },
  { label: "Sunset & sea", value: "coastal", tag: "sunset" },
  { label: "Family day out", value: "family", tag: "family" },
  { label: "Spiritual reset", value: "spiritual", tag: "culture" },
];

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [rating, setRating] = useState<string>("all");
  const [maxPrice, setMaxPrice] = useState<number>(3);
  const [openNow, setOpenNow] = useState(false);
  const [mood, setMood] = useState<string>(MOOD_OPTIONS[0].value);

  const moodTag = useMemo(() => MOOD_OPTIONS.find((option) => option.value === mood)?.tag ?? null, [mood]);

  const queryParams = useMemo(() => ({ searchQuery, category, rating, maxPrice, openNow, moodTag }), [
    searchQuery,
    category,
    rating,
    maxPrice,
    openNow,
    moodTag,
  ]);

  const { data, isLoading } = useQuery({
    queryKey: ["/search", queryParams],
    queryFn: async () => {
      const params: Record<string, string | number> = {};
      if (searchQuery.trim()) params.q = searchQuery.trim();
      if (category !== "all") params.category = category;
      if (rating !== "all") params.min_rating = Number(rating);
      if (maxPrice < 3) params.max_price = maxPrice;
      if (moodTag) params.tag = moodTag;
      if (openNow) params.open_at = new Date().toISOString();
      return apiRequest<{ results: SearchResult[] }>("GET", "/search", undefined, { params });
    },
  });

  const results = data?.results ?? [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3" data-testid="text-page-title">
            Explore Mumbai Trails
          </h1>
          <p className="text-lg text-muted-foreground">
            Discover curated walking experiences across food, heritage, and nature
          </p>
        </div>

        {/* Search and Filters */}
        <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b pb-6 mb-8 -mx-4 px-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search for colonial cafés, sea-facing promenades..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full" data-testid="select-category">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={String(maxPrice)} onValueChange={(val) => setMaxPrice(Number(val))}>
                <SelectTrigger className="w-full" data-testid="select-budget">
                  <SelectValue placeholder="Budget" />
                </SelectTrigger>
                <SelectContent>
                  {PRICE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={rating} onValueChange={setRating}>
                <SelectTrigger className="w-full" data-testid="select-rating">
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  {RATING_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Mood & advanced filters */}
        <div className="grid gap-6 md:grid-cols-[2fr_3fr] mb-10">
          <div className="border rounded-2xl p-6 bg-card space-y-4">
            <div>
              <p className="font-serif text-xl font-semibold mb-2">Mood presets</p>
              <p className="text-sm text-muted-foreground mb-4">
                Pick the vibe and we will automatically tune the tags.
              </p>
              <ToggleGroup type="single" value={mood} onValueChange={(value) => value && setMood(value)} className="flex flex-wrap gap-2">
                {MOOD_OPTIONS.map((option) => (
                  <ToggleGroupItem key={option.value} value={option.value} className="px-4 py-2 rounded-full border data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                    {option.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium">Max budget</p>
                <span className="text-sm text-muted-foreground">Up to {["Free", "Budget", "Mid-range", "Premium"][maxPrice]}</span>
              </div>
              <Slider
                max={3}
                min={0}
                step={1}
                value={[maxPrice]}
                onValueChange={(value) => setMaxPrice(value[0] ?? 3)}
              />
            </div>
            <div className="flex items-center justify-between rounded-xl border px-4 py-3 bg-muted/40">
              <div>
                <p className="font-medium">Open now</p>
                <p className="text-sm text-muted-foreground">Only show places currently open</p>
              </div>
              <Switch checked={openNow} onCheckedChange={setOpenNow} />
            </div>
          </div>
          <div className="border rounded-2xl p-6 bg-muted/40">
            <p className="font-semibold mb-4">Live filters</p>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              {searchQuery && <Badge variant="outline">Search: {searchQuery}</Badge>}
              {category !== "all" && <Badge variant="outline">Category: {CATEGORY_OPTIONS.find((o) => o.value === category)?.label}</Badge>}
              {rating !== "all" && <Badge variant="outline">Rating ≥ {rating}</Badge>}
              {maxPrice < 3 && <Badge variant="outline">Budget ≤ {["Free", "Budget", "Mid-range", "Premium"][maxPrice]}</Badge>}
              {openNow && <Badge variant="outline">Open now</Badge>}
              {moodTag && <Badge variant="outline">Mood tag: {moodTag}</Badge>}
              {!searchQuery && category === "all" && rating === "all" && maxPrice === 3 && !openNow && !moodTag && (
                <p className="text-xs">No filters applied—showing everything we have.</p>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <LoadingState />
        ) : results.length > 0 ? (
          <>
            <div className="mb-4 text-sm text-muted-foreground" data-testid="text-results-count">
              Showing {results.length} places
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((result) => (
                <SearchResultCard key={result.id} result={result} />
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            title="No POIs found"
            description="Try adjusting your filters or widen the search"
            icon="map"
          />
        )}
      </div>
    </div>
  );
}
