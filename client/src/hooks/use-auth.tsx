import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { User, InsertUser } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string, recaptchaToken: string) => Promise<void>;
  register: (userData: Omit<InsertUser, "password"> & { password: string, recaptchaToken: string }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Check if user is already authenticated
  useEffect(() => {
    checkAuth()
      .then((isAuthenticated) => {
        // If we're on login or signup page but already authenticated, redirect to dashboard
        if (isAuthenticated && (window.location.pathname === "/login" || window.location.pathname === "/signup")) {
          navigate("/dashboard");
        }
        // If we're on a protected page but not authenticated, redirect to login
        else if (!isAuthenticated && 
            !["/login", "/signup"].includes(window.location.pathname) && 
            window.location.pathname !== "/") {
          navigate("/login");
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Login function
  const login = async (username: string, password: string, recaptchaToken: string) => {
    try {
      const response = await apiRequest("POST", "/api/auth/login", { username, password, recaptchaToken });
      const data = await response.json();
      setUser(data.user);
      navigate("/dashboard");
      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.user.firstName}!`,
      });
    } catch (error) {
      console.error("Login error:", error);
      throw new Error(error instanceof Error ? error.message : "Invalid username or password");
    }
  };

  // Register function
  const register = async (userData: Omit<InsertUser, "password"> & { password: string, recaptchaToken: string }) => {
    try {
      // Extract recaptchaToken before sending to API
      const { recaptchaToken, ...userDataWithoutCaptcha } = userData;
      const response = await apiRequest("POST", "/api/auth/register", {
        ...userDataWithoutCaptcha,
        recaptchaToken
      });
      const data = await response.json();
      setUser(data.user);
      navigate("/dashboard");
      toast({
        title: "Registration Successful",
        description: `Welcome to PayHub, ${data.user.firstName}!`,
      });
    } catch (error) {
      console.error("Registration error:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to create account");
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout", {});
      setUser(null);
      // Invalidate all queries to clear the cache
      queryClient.invalidateQueries();
      toast({
        title: "Logout Successful",
        description: "You have been logged out successfully",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout Failed",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Check authentication status
  const checkAuth = async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/session", {
        credentials: "include",
      });
      
      if (!response.ok) {
        return false;
      }
      
      const data = await response.json();
      if (data.user) {
        setUser(data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Auth check error:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        checkAuth,
      }}
    >
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
