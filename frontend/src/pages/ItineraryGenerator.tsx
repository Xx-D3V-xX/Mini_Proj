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
import type { Itinerary, Poi } from "@/lib/types";

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
    queryKey: ["/pois", { page: 1 }],
    queryFn: () => apiRequest<{ items: Poi[] }>("GET", "/pois", undefined, { params: { page: 1 } }),
  });
  const pois = poiResponse?.items ?? [];

  const generateMutation = useMutation({
    mutationFn: (payload: GenerateItineraryInput) =>
      apiRequest<Itinerary>("POST", "/itineraries/generate", payload),
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

  const poiSelections = useMemo(() => pois.slice(0, 10), [pois]);

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
            We pull POIs from the CSV-backed database, score them via the AI service, and stitch a
            time-aware route for you.
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
                </div>

                <Button type="submit" className="w-full" disabled={generateMutation.isPending}>
                  {generateMutation.isPending ? "Generating..." : "Generate itinerary"}
                </Button>
              </form>
            </Form>
          </Card>

          <div className="space-y-6">
            {generateMutation.isPending && (
              <Card className="p-6">
                <LoadingState />
              </Card>
            )}

            {itinerary ? (
              <Card className="p-6 space-y-4">
                <div className="flex flex-col gap-2">
                  <h2 className="font-serif text-2xl font-semibold">{itinerary.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {itinerary.total_distance_km?.toFixed(1)} km · {itinerary.total_time_min} minutes
                    on the move
                  </p>
                </div>
                <div className="space-y-3">
                  {itinerary.items.map((item) => (
                    <div
                      key={`${item.poi_id}-${item.start_time}`}
                      className="flex gap-3 rounded-xl border p-4 items-start"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Navigation className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <p className="font-semibold">{item.name}</p>
                          <span className="text-xs font-mono text-muted-foreground">
                            {item.start_time} → {item.end_time}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                          <MapPin className="w-3 h-3" />
                          {item.distance_km} km hop · {item.travel_minutes} min travel
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ) : (
              <Card className="p-8 h-full flex flex-col items-center justify-center text-center gap-4">
                <Compass className="w-10 h-10 text-primary" />
                <p className="font-serif text-2xl font-semibold">Your day will appear here</p>
                <p className="text-muted-foreground">
                  Select a mood, tweak times, and let the AI orchestrate a relaxed loop across the
                  city.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
