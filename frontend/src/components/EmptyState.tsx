import { Button } from "@/components/ui/button";
import { AlertTriangle, Map, Sparkles } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: "map" | "sparkles" | "warning";
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon = "map",
}: EmptyStateProps) {
  const Icon = icon === "sparkles" ? Sparkles : icon === "warning" ? AlertTriangle : Map;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-muted/50 p-6 mb-4">
        <Icon className="w-12 h-12 text-muted-foreground" />
      </div>
      <h3 className="font-serif text-2xl font-bold mb-2" data-testid="text-empty-title">
        {title}
      </h3>
      <p className="text-muted-foreground max-w-md mb-6" data-testid="text-empty-description">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} data-testid="button-empty-action">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
