import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Compass, LogOut, User, Sparkles } from "lucide-react";

interface NavbarProps {
  user?: { name: string; email: string; avatarUrl?: string } | null;
  onLogin?: () => void;
  onLogout?: () => void;
}

export function Navbar({ user, onLogin, onLogout }: NavbarProps) {
  const [location] = useLocation();

  const getInitials = (name?: string) => {
    if (!name) {
      return "MT";
    }
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover-elevate px-3 py-2 rounded-lg" data-testid="link-home">
          <Compass className="w-6 h-6 text-primary" />
          <span className="font-serif text-xl font-bold">
            Mumb<span className="text-primary">AI</span> Trails
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Button
            variant={location === "/" ? "secondary" : "ghost"}
            className="gap-2"
            data-testid="nav-home"
            asChild
          >
            <Link href="/">Home</Link>
          </Button>
          <Button
            variant={location === "/explore" ? "secondary" : "ghost"}
            className="gap-2"
            data-testid="nav-explore"
            asChild
          >
            <Link href="/explore">Explore</Link>
          </Button>
          {user ? (
            <Button
              variant={location === "/itinerary/generate" ? "secondary" : "ghost"}
              className="gap-2"
              data-testid="nav-generate"
              asChild
            >
              <Link href="/itinerary/generate">
                <Sparkles className="w-4 h-4" />
                AI Generator
              </Link>
            </Button>
          ) : (
            <Button
              variant="ghost"
              className="gap-2"
              onClick={onLogin}
              data-testid="nav-generate"
            >
              <Sparkles className="w-4 h-4" />
              AI Generator
            </Button>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full" data-testid="button-user-menu">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium" data-testid="text-user-name">{user.name}</p>
                    <p className="text-xs text-muted-foreground" data-testid="text-user-email">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild data-testid="menu-profile">
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} data-testid="menu-logout">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={onLogin} data-testid="button-login">
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
