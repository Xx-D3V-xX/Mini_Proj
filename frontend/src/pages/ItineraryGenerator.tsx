import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Compass, MapPin, Navigation, Sparkles } from "lucide-react";

import { LoadingState } from "@/components/LoadingState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { generateItinerarySchema, type GenerateItineraryInput } from "@/lib/schemas";
import type { Itinerary, SearchResult } from "@/lib/types";
import { exportItineraryToPdf } from "@/lib/itineraryExport";

const MOODS = [
  { label: "Culture & heritage", value: "culture" },
  { label: "Street food crawl", value: "foodie" },
  { label: "Outdoor & sea breeze", value: "coastal" },
  { label: "Family friendly", value: "family" },
];

export default function ItineraryGenerator() {
  const { toast } = useToast();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);

  const form = useForm<GenerateItineraryInput>({
    resolver: zodResolver(generateItinerarySchema),
    defaultValues: {
      mood: MOODS[0].value,
      start_location: { lat: 19.076, lng: 72.8777 },
      time_window: { start: "09:00", end: "19:00" },
      poi_ids: [],
    },
  });

  const { data: poiResponse, isLoading: poisLoading } = useQuery({
    queryKey: ["/search", { limit: 12 }],
    queryFn: () => apiRequest<{ results: SearchResult[] }>("GET", "/search", undefined, { params: { limit: 12 } }),
  });
  const pois = poiResponse?.results ?? [];
  const poiSelections = useMemo(() => pois.slice(0, 10), [pois]);
  const poiLookup = useMemo(() => {
    const map = new Map<string, SearchResult>();
    poiSelections.forEach((poi) => map.set(poi.id, poi));
    return map;
  }, [poiSelections]);

  const generateMutation = useMutation({
    mutationFn: (payload: GenerateItineraryInput) => {
      const selected = payload.poi_ids?.length ? payload.poi_ids : poiSelections.slice(0, 3).map((poi) => poi.id);
      const requestBody = {
        title: `${payload.mood} trail`,
        date: new Date().toISOString(),
        mode: "MIXED",
        items: selected.map((poi_id) => ({ poi_id })),
      };
      // Use the authenticated endpoint so generated plans are tied to the
      // logged-in user and show up in their profile history. The backend also
      // exposes /itineraries/generate for unauthenticated API/http use.
      return apiRequest<Itinerary>("POST", "/itineraries", requestBody);
    },
    onSuccess: (result) => {
      setItinerary(result);
      toast({
        title: "Itinerary locked in",
        description: "We balanced travel time, opening hours, and your preferences.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Could not generate itinerary",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (values: GenerateItineraryInput) => {
    generateMutation.mutate(values);
  };

  const selectedPois = form.watch("poi_ids") ?? [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            AI day planner
          </p>
          <h1 className="font-serif text-4xl font-bold">Tell us how you'd like to feel in Mumbai</h1>
          <p className="text-muted-foreground">
            We pull POIs from the normalized database, score them via the AI service, and stitch a time-aware route for you.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
          <Card className="p-6 space-y-6 sticky top-20 self-start">
            <Form {...form}>
              <form className="space-y-5" onSubmit={form.handleSubmit(handleSubmit)}>
                <FormField
                  control={form.control}
                  name="mood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What's the vibe?</FormLabel>
                      <div className="grid gap-2">
                        {MOODS.map((option) => (
                          <Button
                            key={option.value}
                            type="button"
                            variant={field.value === option.value ? "default" : "outline"}
                            className="justify-start"
                            onClick={() => field.onChange(option.value)}
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            {option.label}
                          </Button>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="start_location.lat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Starting latitude</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="start_location.lng"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Starting longitude</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="time_window.start"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="time_window.end"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wrap-up time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <FormLabel>Must-visit picks (optional)</FormLabel>
                  {poisLoading ? (
                    <Skeleton className="h-12 w-full" />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {poiSelections.map((poi) => {
                        const isSelected = selectedPois.includes(poi.id);
                        return (
                          <Badge
                            key={poi.id}
                            variant={isSelected ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => {
                              form.setValue(
                                "poi_ids",
                                isSelected
                                  ? selectedPois.filter((id) => id !== poi.id)
                                  : [...selectedPois, poi.id],
                              );
                            }}
                          >
                            {poi.name}
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                  <FormMessage />
                </div>

                <Button type="submit" className="w-full" disabled={generateMutation.isPending}>
                  {generateMutation.isPending ? "Planning..." : "Generate itinerary"}
                </Button>
              </form>
            </Form>
          </Card>

          <div className="space-y-6">
            {generateMutation.isPending && <LoadingState />}
            {itinerary ? (
              <div className="space-y-6">
                <div className="border rounded-2xl p-6 bg-card">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-sm uppercase tracking-wide text-muted-foreground">Your custom trail</p>
                      <h2 className="font-serif text-3xl font-bold">{itinerary.title}</h2>
                    </div>
                    <div className="flex flex-col items-end gap-2 text-sm text-muted-foreground">
                      <div className="space-y-1 text-right">
                        <p>Total distance: {itinerary.total_distance_km?.toFixed(1) ?? "—"} km</p>
                        <p>Total travel time: {itinerary.total_time_min ?? "—"} min</p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => exportItineraryToPdf(itinerary)}
                      >
                        Export as PDF
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  {itinerary.items.map((item, index) => {
                    const poiInfo = poiLookup.get(item.poi_id);
                    return (
                      <Card key={`${item.poi_id}-${index}`} className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-serif text-xl font-semibold">{poiInfo?.name ?? item.poi_id}</h3>
                            {poiInfo && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="w-4 h-4" />
                                {poiInfo.lat.toFixed(3)}, {poiInfo.lon.toFixed(3)}
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground flex flex-wrap gap-3">
                            {item.start_time && (
                              <span>
                                {new Date(item.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                {item.end_time
                                  ? ` — ${new Date(item.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                                  : ""}
                              </span>
                            )}
                            {typeof item.leg_distance_km === "number" && (
                              <span>
                                <Navigation className="inline w-4 h-4 mr-1" />
                                {item.leg_distance_km.toFixed(1)} km
                              </span>
                            )}
                            {typeof item.leg_time_min === "number" && (
                              <span>
                                <Compass className="inline w-4 h-4 mr-1" />
                                {item.leg_time_min} min travel
                              </span>
                            )}
                          </p>
                          {item.note && <p className="text-sm mt-1">{item.note}</p>}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ) : (
              <Card className="p-6 text-center space-y-3">
                <Compass className="w-10 h-10 mx-auto text-primary" />
                <p className="font-semibold">No plan generated yet</p>
                <p className="text-sm text-muted-foreground">
                  Fill in the form and we will craft a realistic sequence with distance and leg times.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
