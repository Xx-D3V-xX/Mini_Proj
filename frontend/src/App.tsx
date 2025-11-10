import { Switch, Route } from "wouter";
import { useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import { Navbar } from "@/components/Navbar";
import { AuthModal } from "@/components/AuthModal";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Landing from "@/pages/Landing";
import Explore from "@/pages/Explore";
import Profile from "@/pages/Profile";
import ItineraryGenerator from "@/pages/ItineraryGenerator";
import NotFound from "@/pages/not-found";

function AppContent() {
  const { user, login, register, logout } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleOpenAuthModal = () => {
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} onLogin={handleOpenAuthModal} onLogout={logout} />
      <Switch>
        <Route path="/">
          <Landing isAuthenticated={!!user} onLogin={handleOpenAuthModal} />
        </Route>
        <Route path="/explore">
          <Explore />
        </Route>
        <Route path="/profile">
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        </Route>
        <Route path="/itinerary/generate">
          <ProtectedRoute>
            <ItineraryGenerator />
          </ProtectedRoute>
        </Route>
        <Route component={NotFound} />
      </Switch>
      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        onLogin={login}
        onRegister={register}
      />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
