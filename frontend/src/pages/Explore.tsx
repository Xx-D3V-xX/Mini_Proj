import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Search, Sparkles } from "lucide-react";

import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { PoiCard } from "@/components/PoiCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Poi } from "@/lib/types";

const CATEGORY_OPTIONS = [
  { label: "All Categories", value: "all" },
  { label: "Landmark", value: "Landmark" },
  { label: "Viewpoint", value: "Viewpoint" },
  { label: "Museum", value: "Museum" },
  { label: "Nature", value: "Nature" },
  { label: "Market", value: "Market" },
  { label: "Temple", value: "Temple" },
];

const PRICE_OPTIONS = [
  { label: "All Budgets", value: "all" },
  { label: "Free", value: "0" },
  { label: "Budget friendly", value: "1" },
  { label: "Mid-range", value: "2" },
  { label: "Premium", value: "3" },
];

const RATING_OPTIONS = [
  { label: "Any rating", value: "all" },
  { label: "4★ & up", value: "4" },
  { label: "4.5★ & up", value: "4.5" },
];

const MOOD_OPTIONS = [
  { label: "Cultural immersion", value: "culture" },
  { label: "Foodie crawl", value: "foodie" },
  { label: "Sunset & sea", value: "coastal" },
  { label: "Family day out", value: "family" },
  { label: "Spiritual reset", value: "spiritual" },
];

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [priceLevel, setPriceLevel] = useState<string>("all");
  const [rating, setRating] = useState<string>("all");
  const [mood, setMood] = useState<string>(MOOD_OPTIONS[0].value);
  const [recommendations, setRecommendations] = useState<Poi[] | null>(null);
  const { toast } = useToast();

  const queryParams = useMemo(() => ({ searchQuery, category, priceLevel, rating }), [
    searchQuery,
    category,
    priceLevel,
    rating,
  ]);

  const { data, isLoading } = useQuery({
    queryKey: ["/pois", queryParams],
    queryFn: async () => {
      const params: Record<string, string | number> = { page: 1 };
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (category !== "all") params.category = category;
      if (priceLevel !== "all") params.price_level = Number(priceLevel);
      if (rating !== "all") params.rating_min = Number(rating);
      return apiRequest<{ items: Poi[]; total: number }>("GET", "/pois", undefined, { params });
    },
  });

  const recommendMutation = useMutation({
    mutationFn: async () => {
      const filters: Record<string, string | number | string[] | undefined> = {};
      if (category !== "all") filters.category = category;
      if (priceLevel !== "all") filters.price_level = Number(priceLevel);
      if (rating !== "all") filters.rating_min = Number(rating);
      const response = await apiRequest<{ items: Poi[] }>("POST", "/integrations/recommend", {
        mood,
        prefs: {},
        location: { lat: 19.076, lng: 72.8777 },
        filters,
      });
      return response.items;
    },
    onSuccess: (items) => {
      setRecommendations(items);
      toast({
        title: "Tailored picks ready",
        description: "We matched POIs to your mood and filters.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Could not fetch AI picks",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const pois = data?.items ?? [];

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
              <Select value={priceLevel} onValueChange={setPriceLevel}>
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

        {/* AI Suggestions */}
        <div className="grid gap-6 md:grid-cols-[2fr_3fr] mb-10">
          <div className="border rounded-2xl p-6 bg-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-serif text-xl font-semibold">Need inspiration?</p>
                <p className="text-sm text-muted-foreground">
                  Let the AI shortlist places that match your vibe.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger className="w-full" data-testid="select-mood">
                  <SelectValue placeholder="Select a mood" />
                </SelectTrigger>
                <SelectContent>
                  {MOOD_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                className="w-full"
                onClick={() => recommendMutation.mutate()}
                disabled={recommendMutation.isPending}
              >
                {recommendMutation.isPending ? "Generating..." : "Get AI suggestions"}
              </Button>
              {recommendations?.length ? (
                <div className="space-y-2">
                  <p className="text-xs uppercase text-muted-foreground">Suggested</p>
                  <div className="flex flex-wrap gap-2">
                    {recommendations.slice(0, 6).map((poi) => (
                      <Badge key={poi.id} variant="secondary">
                        {poi.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
          <div className="border rounded-2xl p-6 bg-muted/40">
            <p className="font-semibold mb-4">Live filters</p>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              {searchQuery && <Badge variant="outline">Search: {searchQuery}</Badge>}
              {category !== "all" && <Badge variant="outline">Category: {category}</Badge>}
              {priceLevel !== "all" && <Badge variant="outline">Budget: {PRICE_OPTIONS.find((o) => o.value === priceLevel)?.label}</Badge>}
              {rating !== "all" && <Badge variant="outline">Rating ≥ {rating}</Badge>}
              {!searchQuery && category === "all" && priceLevel === "all" && rating === "all" && (
                <p className="text-xs">No filters applied—showing the freshest imports from the CSV dataset.</p>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <LoadingState />
        ) : pois.length > 0 ? (
          <>
            <div className="mb-4 text-sm text-muted-foreground" data-testid="text-results-count">
              Showing {pois.length} places
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pois.map((poi) => (
                <PoiCard key={poi.id} poi={poi} />
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
        {recommendMutation.isPending && (
          <div className="mt-8">
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        )}
      </div>
    </div>
  );
}
