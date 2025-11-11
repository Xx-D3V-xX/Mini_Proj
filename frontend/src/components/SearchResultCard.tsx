import { MapPin, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { SearchResult } from "@/lib/types";

interface SearchResultCardProps {
  result: SearchResult;
}

const priceCopy: Record<number, string> = {
  0: "Free",
  1: "Budget",
  2: "Mid-range",
  3: "Premium",
};

export function SearchResultCard({ result }: SearchResultCardProps) {
  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-serif text-xl font-semibold">{result.name}</h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            {result.lat.toFixed(3)}, {result.lon.toFixed(3)}
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Star className="w-4 h-4 fill-accent text-accent" />
          <span>{result.rating ? result.rating.toFixed(1) : "New"}</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
        {typeof result.price_level === "number" && (
          <Badge variant="secondary">{priceCopy[result.price_level] ?? "₹" + result.price_level}</Badge>
        )}
        {typeof result.distance_km === "number" && (
          <Badge variant="outline">{result.distance_km.toFixed(1)} km away</Badge>
        )}
        {result.open_now !== undefined && (
          <Badge variant={result.open_now ? "default" : "outline"}>
            {result.open_now ? "Open now" : "Closed"}
          </Badge>
        )}
      </div>
    </Card>
  );
}
