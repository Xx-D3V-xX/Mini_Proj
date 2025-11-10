import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Compass, MapPin, Sparkles, Star, Clock, Users } from "lucide-react";
import { Link } from "wouter";
import gatewayImage from "@assets/generated_images/Mumbai_Gateway_India_hero_8e73777d.png";
import marineDriveImage from "@assets/generated_images/Marine_Drive_promenade_view_bc704642.png";
import foodImage from "@assets/generated_images/Mumbai_street_food_scene_c3a1fe2c.png";
import heritageImage from "@assets/generated_images/CST_heritage_architecture_db71f915.png";
import gardenImage from "@assets/generated_images/Hanging_Gardens_greenery_df4de61f.png";
import marketImage from "@assets/generated_images/Colaba_market_shopping_a7e5be47.png";

interface LandingProps {
  isAuthenticated: boolean;
  onLogin: () => void;
}

export default function Landing({ isAuthenticated, onLogin }: LandingProps) {
  const features = [
    {
      icon: Compass,
      title: "Discover Trails",
      description: "Explore curated walking trails covering Mumbai's best food, heritage, and hidden gems",
    },
    {
      icon: Sparkles,
      title: "AI-Powered Itineraries",
      description: "Generate personalized day plans based on your interests, budget, and travel style",
    },
    {
      icon: MapPin,
      title: "Local Insights",
      description: "Get authentic recommendations from locals and track your Mumbai adventures",
    },
  ];

  const featuredTrails = [
    {
      id: "1",
      title: "Heritage Architecture Tour",
      image: heritageImage,
      category: "Heritage",
      duration: "3-4 hours",
      rating: 5,
    },
    {
      id: "2",
      title: "Street Food Paradise",
      image: foodImage,
      category: "Food",
      duration: "2-3 hours",
      rating: 5,
    },
    {
      id: "3",
      title: "Coastal Charm Walk",
      image: marineDriveImage,
      category: "Nature",
      duration: "2 hours",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={gatewayImage}
            alt="Gateway of India"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-background" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <Badge className="mb-6 bg-primary/20 backdrop-blur-md border-primary/30 text-white text-sm px-4 py-2">
            Discover Mumbai Like Never Before
          </Badge>
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-white mb-6 max-w-4xl mx-auto leading-tight" data-testid="text-hero-title">
            Explore Mumbai's Hidden Gems with AI
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto" data-testid="text-hero-subtitle">
            Curated trails, personalized itineraries, and local insights to make your Mumbai journey unforgettable
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link href="/explore">
                <Button size="lg" className="text-lg px-8 py-6 bg-primary/90 backdrop-blur-md hover:bg-primary border border-primary-border" data-testid="button-hero-explore">
                  <Compass className="w-5 h-5 mr-2" />
                  Go to Explore
                </Button>
              </Link>
            ) : (
              <>
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6 bg-primary/90 backdrop-blur-md hover:bg-primary border border-primary-border" 
                  onClick={onLogin}
                  data-testid="button-hero-getstarted"
                >
                  Get Started Free
                </Button>
                <Link href="/explore">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="text-lg px-8 py-6 bg-background/20 backdrop-blur-md border-white/30 text-white hover:bg-background/30"
                    data-testid="button-hero-explore-guest"
                  >
                    Explore as Guest
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl font-bold mb-4" data-testid="text-features-title">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to your perfect Mumbai adventure
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-8 text-center hover-elevate transition-all">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-serif text-2xl font-bold mb-3" data-testid={`text-feature-title-${index}`}>
                  {feature.title}
                </h3>
                <p className="text-muted-foreground" data-testid={`text-feature-description-${index}`}>
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Trails Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl font-bold mb-4" data-testid="text-trails-title">
              Featured Trails
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Popular curated experiences loved by travelers
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {featuredTrails.map((trail) => (
              <Card key={trail.id} className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer transition-all group">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={trail.image}
                    alt={trail.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <Badge className="absolute top-3 left-3 bg-card/90 backdrop-blur-sm border-card-border text-card-foreground">
                    {trail.category}
                  </Badge>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-serif text-xl font-bold text-white mb-2">
                      {trail.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-white/90">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{trail.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-accent text-accent" />
                        <span>{trail.rating}/5</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div className="text-center">
            <Link href="/explore">
              <Button size="lg" variant="outline" data-testid="button-view-all-trails">
                View All Trails
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "500+", label: "Heritage Sites" },
              { value: "1000+", label: "Food Spots" },
              { value: "50+", label: "Curated Trails" },
              { value: "10K+", label: "Happy Explorers" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="font-serif text-4xl md:text-5xl font-bold text-primary mb-2" data-testid={`text-stat-value-${index}`}>
                  {stat.value}
                </div>
                <div className="text-muted-foreground" data-testid={`text-stat-label-${index}`}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={gardenImage}
            alt="Mumbai Gardens"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/60 to-black/70" />
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6" data-testid="text-cta-title">
            Ready to Start Your Mumbai Adventure?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of travelers discovering the soul of Mumbai with personalized AI-powered itineraries
          </p>
          {!isAuthenticated && (
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 bg-primary/90 backdrop-blur-md hover:bg-primary border border-primary-border" 
              onClick={onLogin}
              data-testid="button-cta-signup"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Sign Up Free
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Compass className="w-6 h-6 text-primary" />
                <span className="font-serif text-xl font-bold">
                  Mumb<span className="text-primary">AI</span> Trails
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Discover Mumbai's hidden gems with AI-powered travel experiences
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/explore" className="hover:text-foreground transition-colors">
                    Explore Trails
                  </Link>
                </li>
                <li>
                  <Link href="/itinerary/generate" className="hover:text-foreground transition-colors">
                    AI Generator
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Categories</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Food & Cuisine</li>
                <li>Heritage Sites</li>
                <li>Nature & Parks</li>
                <li>Shopping</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <p className="text-sm text-muted-foreground">
                Discover the magic of Mumbai, one trail at a time
              </p>
            </div>
          </div>
          <div className="pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; 2024 MumbAI Trails. Explore with confidence.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
