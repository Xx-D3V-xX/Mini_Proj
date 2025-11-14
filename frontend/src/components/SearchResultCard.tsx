import { useState } from "react";
import { MapPin, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { SearchResult } from "@/lib/types";

interface SearchResultCardProps {
  result: SearchResult;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1477586957327-847a0f3f4fe3?w=800&h=600&fit=crop&auto=format&trim=edges";

const priceCopy: Record<number, string> = {
  0: "Free",
  1: "Budget",
  2: "Mid-range",
  3: "Premium",
};

export function SearchResultCard({ result }: SearchResultCardProps) {
  const [imgSrc, setImgSrc] = useState(
    result.image_url ||
      `https://source.unsplash.com/featured/?mumbai,${encodeURIComponent(result.name)}`,
  );

  return (
    <Card className="overflow-hidden hover-elevate active-elevate-2 transition-all group">
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={imgSrc}
          alt={result.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setImgSrc(FALLBACK_IMAGE)}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between gap-3">
          <div>
            <h3 className="font-serif text-lg font-semibold text-white">{result.name}</h3>
            <div className="flex items-center gap-1 text-xs text-white/80">
              <MapPin className="w-3 h-3" />
              {result.lat.toFixed(3)}, {result.lon.toFixed(3)}
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-white/90">
            <Star className="w-4 h-4 fill-accent text-accent" />
            <span>{result.rating ? result.rating.toFixed(1) : "New"}</span>
          </div>
        </div>
      </div>
      <div className="p-4 flex flex-wrap gap-2 text-sm text-muted-foreground">
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
