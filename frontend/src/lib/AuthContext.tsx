import { createContext, useContext, useState, useEffect, ReactNode } from "react";

import { useToast } from "@/hooks/use-toast";
import { ACCESS_TOKEN_KEY, apiRequest } from "@/lib/queryClient";
import type { User } from "@/lib/types";
import type { LoginInput, RegisterInput } from "@/lib/schemas";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const REFRESH_TOKEN_KEY = "refresh_token";

type AuthResponse = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const clearSession = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setUser(null);
  };

  const persistSession = (payload: AuthResponse) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, payload.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, payload.refreshToken);
    setUser(payload.user);
  };

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const me = await apiRequest<User>("GET", "/users/me");
        setUser(me);
      } catch (error) {
        console.warn("Token validation failed:", error);
        clearSession();
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, []);

  const login = async (data: LoginInput) => {
    try {
      const authResponse = await apiRequest<AuthResponse>("POST", "/auth/login", data);
      persistSession(authResponse);

      toast({
        title: "Welcome back!",
        description: "Successfully logged in",
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
      throw error;
    }
  };

  const register = async (data: RegisterInput) => {
    try {
      const authResponse = await apiRequest<AuthResponse>("POST", "/auth/signup", {
        email: data.email,
        password: data.password,
        name: data.name,
      });
      persistSession(authResponse);

      toast({
        title: "Welcome to MumbAI Trails!",
        description: "Your account has been created",
      });
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Could not create account",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = () => {
    apiRequest("POST", "/auth/logout").catch(() => undefined);
    clearSession();
    toast({
      title: "Logged out",
      description: "Come back soon!",
    });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
