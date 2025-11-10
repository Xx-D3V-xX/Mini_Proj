import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Map } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4 p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-6">
          <Map className="w-8 h-8 text-muted-foreground" />
        </div>
        <h1 className="font-serif text-3xl font-bold mb-3">Page Not Found</h1>
        <p className="text-muted-foreground mb-6">
          Looks like you've wandered off the trail. Let's get you back on track.
        </p>
        <Link href="/">
          <Button data-testid="button-home">
            Back to Home
          </Button>
        </Link>
      </Card>
    </div>
  );
}
