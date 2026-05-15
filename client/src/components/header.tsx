import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, User, LogOut, Star, Gem, Sparkles, Trophy, Shield, Sword, Medal, MessageSquare } from "lucide-react";
import { useAuth } from "../lib/simple-auth-client";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef, useMemo } from "react";
import { queryKeys } from "@/lib/queryKeys";

export function Header() {
  const { user, signOut, isAuthenticated, isLoading } = useAuth();
  const [location, navigate] = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  // Memoized query key for stable references
  const exercisesQueryKey = useMemo(() => queryKeys.exercises(), []);
  const userQueryKey = useMemo(() => queryKeys.user(), []);

  // Fetch all exercises to calculate total available points
  const { data: exercises } = useQuery({
    queryKey: exercisesQueryKey,
    enabled: !!isAuthenticated && !isLoading,
    staleTime: 5 * 60 * 1000, // 5 minutes for exercises
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
    select: (data) => data || [], // Ensure array fallback
    placeholderData: [], // Prevent loading flicker
  });

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch current user data with points - only if authenticated
  const { data: currentUser, refetch: refetchUser, isLoading: userDataLoading } = useQuery({
    queryKey: userQueryKey,
    enabled: !!isAuthenticated && !isLoading,
    staleTime: 2 * 60 * 1000, // 2 minutes for user data
    gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
    select: (data) => {
      if (!data) return null;
      // Only select the fields we need for the header
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        totalPoints: data.totalPoints || 0,
        avatar: data.avatar
      };
    },
    placeholderData: null, // Prevent loading flicker
  });

  // Refetch user data when authentication changes
  useEffect(() => {
    if (isAuthenticated && user) {
      refetchUser();
    }
  }, [isAuthenticated, user, refetchUser]);

  // Use currentUser data if available, fallback to auth user
  const displayUser = currentUser || user;

  const getUserInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  const isActiveRoute = (route: string) => {
    return location === route || location.startsWith(route + '/');
  };

  // Calculate total points available in the system
  const totalAvailablePoints = Array.isArray(exercises) 
    ? exercises.reduce((total: number, ex: any) => total + (ex.points || 0), 0)
    : 0;

  // Calculate user's percentage of total points
  const getUserPercentage = (userPoints: number, totalPoints: number) => {
    if (totalPoints === 0) return 0;
    return (userPoints / totalPoints) * 100;
  };

  // Get user rank based on percentage of total points earned
  const getUserRank = (xp: number) => {
    const percentage = getUserPercentage(xp, totalAvailablePoints);
    
    if (percentage >= 81) return { 
      name: "Mitológico", 
      icon: Crown, 
      color: "#E8B4BC", // Mythic pink
      bgColor: "rgba(232, 180, 188, 0.15)",
      borderColor: "rgba(232, 180, 188, 0.3)"
    };
    if (percentage >= 65) return { 
      name: "Lendário", 
      icon: Star, 
      color: "#FFD700", // Legendary yellow/gold
      bgColor: "rgba(255, 215, 0, 0.15)",
      borderColor: "rgba(255, 215, 0, 0.3)"
    };
    if (percentage >= 49) return { 
      name: "Elite", 
      icon: Gem, 
      color: "#FF8C00", // Epic orange
      bgColor: "rgba(255, 140, 0, 0.15)",
      borderColor: "rgba(255, 140, 0, 0.3)"
    };
    if (percentage >= 33) return { 
      name: "Veterano", 
      icon: Shield, 
      color: "#5E5CFF", // Rare blue
      bgColor: "rgba(94, 92, 255, 0.15)",
      borderColor: "rgba(94, 92, 255, 0.3)"
    };
    if (percentage >= 17) return { 
      name: "Aventureiro", 
      icon: Sword, 
      color: "#50C878", // Uncommon green
      bgColor: "rgba(80, 200, 120, 0.15)",
      borderColor: "rgba(80, 200, 120, 0.3)"
    };
    return { 
      name: "Novato", 
      icon: Sparkles, 
      color: "#C0C0C0", // Common gray
      bgColor: "rgba(192, 192, 192, 0.15)",
      borderColor: "rgba(192, 192, 192, 0.3)"
    };
  };

  const userRank = getUserRank((displayUser as any)?.totalPoints || 0);

  return (
    <header className="border-b border-accent/20 relative z-[99] backdrop-blur-sm" style={{ backgroundColor: 'rgba(17, 17, 17, 0.8)', borderBottomColor: 'rgba(55, 65, 81, 0.5)'
 }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center justify-center hover:opacity-80 transition-opacity">
            <img 
              src="/avatars/logo.png" 
              alt="CodeQuest" 
              className="h-14 w-auto"
            />
          </Link>

          {/* User Menu */}
          <div className="flex items-center space-x-4 relative" ref={menuRef}>
            {isAuthenticated && user ? (
              <>
                {/* User XP and Rank */}
                <div className="hidden sm:flex items-center space-x-3">
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-secondary/20 to-accent/20 px-3 py-1 rounded-full border border-accent/30">
                    <Gem className="w-4 h-4" style={{ color: '#9d4edd' }} />
                    <span className="text-sm font-medium" style={{ color: '#9d4edd' }}>
                      {userDataLoading ? (
                        <span className="animate-pulse">...</span>
                      ) : (
                        <>
                          <span className="number">{(displayUser as any)?.totalPoints || (displayUser as any)?.points || 0}</span> XP
                        </>
                      )}
                    </span>
                  </div>
                  <div 
                    className="flex items-center space-x-1 px-3 py-1 rounded-full transition-all duration-300"
                    style={{ 
                      backgroundColor: userRank.bgColor,
                      border: `2px solid ${userRank.borderColor}`,
                      boxShadow: `0 0 10px ${userRank.borderColor}`
                    }}
                  >
                    {userDataLoading ? (
                      <>
                        <div className="w-4 h-4 animate-pulse bg-gray-500 rounded-full" />
                        <span className="text-xs font-bold text-gray-400 animate-pulse">...</span>
                      </>
                    ) : (
                      <>
                        <userRank.icon className="w-4 h-4" style={{ color: userRank.color }} />
                        <span className="text-xs font-bold" style={{ color: userRank.color }}>
                          {userRank.name}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* User Avatar - Always visible */}
                <Button 
                  className="relative h-10 w-10 rounded-full bg-transparent hover:bg-accent/20 hover:scale-110 transition-all duration-200 hover:shadow-lg"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage 
                      src={(displayUser as any)?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${(displayUser as any)?.name}`} 
                      alt={(displayUser as any)?.name || "User"} 
                    />
                    <AvatarFallback>
                      {getUserInitials((displayUser as any)?.name || "")}
                    </AvatarFallback>
                  </Avatar>
                </Button>

                {/* User Submenu - Positioned relative to this container */}
                {showUserMenu && (
                  <div className="absolute top-12 right-0 w-80 max-w-[calc(100vw-2rem)] sm:max-w-80 shadow-2xl z-[999] rounded-lg" style={{ backgroundColor: 'rgb(45, 45, 45)' }}>
                {/* Header do Perfil */}
                <div className="p-5 border-b border-accent/20">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12 ring-2 ring-accent/30">
                      <AvatarImage 
                        src={(displayUser as any)?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${(displayUser as any)?.name}`} 
                        alt={(displayUser as any)?.name || "User"} 
                      />
                      <AvatarFallback className="bg-gradient-to-br from-accent to-secondary text-white font-bold">
                        {getUserInitials((displayUser as any)?.name || "")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <h3 className="font-semibold text-lg" style={{ color: '#fff6e9' }}>
                        {userDataLoading ? (
                          <span className="animate-pulse bg-gray-600 h-5 w-24 rounded block"></span>
                        ) : (
                          (displayUser as any)?.name
                        )}
                      </h3>
                      <p className="text-sm opacity-80" style={{ color: '#fff6e9' }}>
                        {userDataLoading ? (
                          <span className="animate-pulse bg-gray-600 h-4 w-32 rounded block mt-1"></span>
                        ) : (
                          (displayUser as any)?.email
                        )}
                      </p>

                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-3">
                  <div 
                    className="cursor-pointer hover:bg-gray-600 rounded-lg p-3 transition-all duration-200"
                    onClick={() => {
                      navigate('/auth/profile');
                      setShowUserMenu(false);
                    }}
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-white">
                          Perfil do Aventureiro
                        </div>
                        <div className="text-xs text-white opacity-70">
                          Ver suas conquistas e progresso
                        </div>
                      </div>
                    </div>
                  </div>


                  <div 
                    className="cursor-pointer hover:bg-gray-600 rounded-lg p-3 transition-all duration-200"
                    onClick={() => {
                      navigate('/ranking');
                      setShowUserMenu(false);
                    }}
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                        <Medal className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-white">
                          Ranking
                        </div>
                        <div className="text-xs text-white opacity-70">
                          Ranking de alunos
                        </div>
                      </div>
                    </div>
                  </div>

                  <div 
                    className="cursor-pointer hover:bg-gray-600 rounded-lg p-3 transition-all duration-200"
                    onClick={() => {
                      navigate('/feedback');
                      setShowUserMenu(false);
                    }}
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-white">
                          Enviar Feedback
                        </div>
                        <div className="text-xs text-white opacity-70">
                          Ajude-nos a melhorar a plataforma
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                

                <div className="mx-2 h-px bg-accent/20" />

                {/* Logout */}
                <div className="p-3">
                  <div 
                    className="cursor-pointer hover:bg-gray-600 rounded-lg p-3 transition-all duration-200"
                    onClick={() => {
                      handleSignOut();
                      setShowUserMenu(false);
                    }}
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                        <LogOut className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-white">
                          Sair da Conta
                        </div>
                        <div className="text-xs text-white opacity-70">
                          Desconectar-se do CodeQuest
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
                )}

              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/signin">
                <Button className="rpg-button">Entrar</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}