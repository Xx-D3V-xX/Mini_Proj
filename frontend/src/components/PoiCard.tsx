import { useMemo, useState } from "react";
import { MapPin, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Poi } from "@/lib/types";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1477586957327-847a0f3f4fe3?w=800&h=600&fit=crop&auto=format&trim=edges";

const priceCopy: Record<number, string> = {
  0: "Free entry",
  1: "Budget friendly",
  2: "Mid-range",
  3: "Premium",
};

interface PoiCardProps {
  poi: Poi;
  onSelect?: (poi: Poi) => void;
}

export function PoiCard({ poi, onSelect }: PoiCardProps) {
  const primaryCategory = poi.categories[0]?.name ?? "POI";
  const [imgSrc, setImgSrc] = useState(
    poi.image_url || `https://source.unsplash.com/featured/?mumbai,${encodeURIComponent(primaryCategory)}`
  );

  const tags = useMemo(() => poi.tags?.map((tag) => tag.name).slice(0, 3).join(" · "), [poi.tags]);

  return (
    <Card
      className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer transition-all group"
      onClick={() => onSelect?.(poi)}
      data-testid={`card-poi-${poi.id}`}
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={imgSrc}
          alt={poi.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setImgSrc(FALLBACK_IMAGE)}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <Badge className="absolute top-3 left-3 bg-card/90 backdrop-blur-sm border-card-border text-card-foreground">
          {primaryCategory}
        </Badge>
        {poi.reason && (
          <div className="absolute bottom-3 left-3 right-3 text-xs font-medium text-primary-foreground bg-primary/90 rounded-md px-3 py-1 shadow-lg">
            {poi.reason}
          </div>
        )}
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-serif text-xl font-bold mb-1">{poi.name}</h3>
            {tags ? (
              <div className="flex items-center gap-1 text-xs uppercase tracking-wider text-muted-foreground">
                <MapPin className="w-3 h-3" />
                {tags}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">{primaryCategory}</p>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="w-4 h-4 fill-accent text-accent" />
            <span>{poi.rating ? poi.rating.toFixed(1) : "New"}</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-3">{poi.description}</p>
        <div className="flex items-center justify-between flex-wrap gap-2 text-sm text-muted-foreground">
          {typeof poi.price_level === "number" && (
            <Badge variant="secondary">{priceCopy[poi.price_level] ?? `₹${poi.price_level}`}</Badge>
          )}
          <span>Lat {poi.latitude.toFixed(3)} · Lng {poi.longitude.toFixed(3)}</span>
        </div>
      </div>
    </Card>
  );
}
