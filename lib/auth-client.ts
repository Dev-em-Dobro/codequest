import React, { useState, useEffect, createContext, useContext, type ReactNode } from "react";

// Types for auth state
interface User {
  id: string;
  email: string;
  name: string;
  points?: number;
  level?: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Auth context
const AuthContext = createContext<{
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (credentials: { email: string; password: string }) => Promise<void>;
  signUp: (credentials: { email: string; password: string; name: string }) => Promise<void>;
  signOut: () => Promise<void>;
} | null>(null);

// Auth context provider
export function AuthContextProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/session", {
        credentials: "include"
      });
      if (response.ok) {
        const session = await response.json();
        if (session.user) {
          setAuthState({
            user: session.user,
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    }
    
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const signIn = async (credentials: { email: string; password: string }) => {
    const response = await fetch("/api/auth/sign-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
      credentials: "include"
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Falha no login");
    }

    await checkAuthStatus();
  };

  const signUp = async (credentials: { email: string; password: string; name: string }) => {
    const response = await fetch("/api/auth/sign-up", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
      credentials: "include"
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Falha no cadastro");
    }

    await checkAuthStatus();
  };

  const signOut = async () => {
    await fetch("/api/auth/sign-out", {
      method: "POST",
      credentials: "include"
    });
    
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const contextValue = {
    ...authState,
    signIn,
    signUp,
    signOut,
  };

  return React.createElement(
    AuthContext.Provider,
    { value: contextValue },
    children
  );
}

// Custom hooks for CodeQuest
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthContextProvider");
  }
  return context;
};

