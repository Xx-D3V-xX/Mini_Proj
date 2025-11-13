import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Link } from "wouter";
import { Calendar, MapPin, Sparkles, Star } from "lucide-react";

import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/AuthContext";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { exportItineraryToPdf } from "@/lib/itineraryExport";
import type { Itinerary, TravelHistoryEntry } from "@/lib/types";

export default function Profile() {
  const { user } = useAuth();
  const {
    data: itineraries,
    isLoading: itinerariesLoading,
    isError,
  } = useQuery<Itinerary[]>({
    queryKey: ["/itineraries"],
    queryFn: getQueryFn<Itinerary[]>({ on401: "returnNull" }),
    enabled: !!user,
  });

  const history = useMemo<TravelHistoryEntry[]>(() => {
    if (!itineraries) return [];
    const visits = new Map<string, TravelHistoryEntry>();
    itineraries.forEach((itinerary) => {
      itinerary.items?.forEach((item) => {
        if (!item.poi_id || item.poi_id.includes("break")) {
          return;
        }
        if (visits.has(item.poi_id)) {
          return;
        }
        visits.set(item.poi_id, {
          id: `${itinerary.id}-${item.poi_id}`,
          name: item.name,
          visitedAt: itinerary.created_at ?? itinerary.updated_at ?? new Date().toISOString(),
          notes: `${item.start_time}–${item.end_time}`,
          tag: itinerary.title,
        });
      });
    });
    return Array.from(visits.values());
  }, [itineraries]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingState />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          title="You're not signed in"
          description="Log in to view your saved itineraries and travel history."
          icon="user"
        />
      </div>
    );
  }

  if (itinerariesLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingState />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          title="We couldn't load your profile"
          description="Please refresh the page or try again later."
          icon="warning"
        />
      </div>
    );
  }

  const itineraryCount = itineraries?.length ?? 0;
  const stopsVisited = history.length;
  const totalDistance = (itineraries ?? []).reduce(
    (sum, itinerary) => sum + (itinerary.total_distance_km ?? 0),
    0,
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Card className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={undefined} alt={user.name ?? user.email} />
              <AvatarFallback className="text-2xl">
                {user.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase() || "MT"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="font-serif text-3xl font-bold">{user.name ?? "Explorer"}</h1>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
                <Button className="gap-2" asChild>
                  <Link href="/itinerary/generate">
                    <Sparkles className="w-4 h-4" />
                    Plan a new day
                  </Link>
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Stat label="Itineraries" value={itineraryCount.toString()} />
                <Stat label="Unique stops logged" value={stopsVisited.toString()} />
                <Stat label="Total km planned" value={`${totalDistance.toFixed(1)} km`} />
              </div>
            </div>
          </div>
        </Card>

        <Tabs defaultValue="itineraries" className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-2">
            <TabsTrigger value="itineraries">My itineraries</TabsTrigger>
            <TabsTrigger value="history">Visited places</TabsTrigger>
          </TabsList>

          <TabsContent value="itineraries">
            {!itineraries?.length ? (
              <EmptyState
                title="You haven't generated any plans yet"
                description="Use the AI itinerary builder to craft your first day in Mumbai."
                actionLabel="Open AI generator"
                icon="sparkles"
                onAction={() => (window.location.href = "/itinerary/generate")}
              />
            ) : (
              <div className="space-y-4">
                {itineraries.map((itinerary) => (
                  <Card key={itinerary.id} className="p-6 space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h3 className="font-serif text-2xl font-semibold">{itinerary.title}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(itinerary.created_at ?? Date.now()), "dd MMM yyyy")}
                        </p>
                      </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                      {itinerary.total_distance_km && (
                        <Badge variant="secondary">
                          {itinerary.total_distance_km.toFixed(1)} km
                        </Badge>
                      )}
                      {itinerary.total_time_min && (
                        <Badge variant="secondary">{itinerary.total_time_min} min</Badge>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => exportItineraryToPdf(itinerary)}
                      >
                        Export PDF
                      </Button>
                    </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {itinerary.items.length} stops scheduled · next up:{" "}
                      {itinerary.items[0]?.name ?? "TBD"}
                    </p>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {itinerary.items.slice(0, 4).map((item) => (
                        <div
                          key={`${itinerary.id}-${item.poi_id}`}
                          className="rounded-xl border p-3 flex items-start gap-3"
                        >
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.start_time} – {item.end_time} · {item.distance_km} km hop
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            {!history.length ? (
              <EmptyState
                title="No visits logged yet"
                description="Generate an itinerary to start keeping track of the places you've explored."
                icon="map"
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {history.map((entry) => (
                  <Card key={entry.id} className="p-5 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Star className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{entry.name}</h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(entry.visitedAt), "dd MMM yyyy")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{entry.tag}</p>
                      <p className="text-xs text-muted-foreground">{entry.notes}</p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-muted/30 p-4 text-center">
      <div className="text-2xl font-semibold text-primary">{value}</div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}
