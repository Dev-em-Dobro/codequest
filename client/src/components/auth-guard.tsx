import React from "react";
import { useAuth } from "../lib/simple-auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { GlowCard } from "./ui/spotlight-card";
import { Button } from "./ui/button";
import { Link, useLocation } from "wouter";
import { Lock, UserPlus, LogIn } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <GlowCard glowColor="purple" customSize={true} className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: 'rgba(157, 78, 221, 0.1)' }}>
              <Lock className="h-10 w-10" style={{ color: '#9d4edd' }} />
            </div>
            <CardTitle className="text-2xl" style={{ color: '#fff6e9', fontFamily: 'var(--font-retro)' }}>Acesso Restrito</CardTitle>
            <CardDescription className="text-base" style={{ color: '#fff6e9', opacity: 0.8 }}>
              Você precisa estar logado para acessar os exercícios do Code Quest
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Link to={`/auth/signin?redirect=${encodeURIComponent(location)}`}>
                <Button className="w-full rpg-button" size="lg">
                  <LogIn className="mr-2 h-5 w-5" />
                  Fazer Login
                </Button>
              </Link>
            </div>
            
          </CardContent>
        </GlowCard>
      </div>
    );
  }

  return <>{children}</>;
}