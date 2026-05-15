import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Header } from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlowCard } from "@/components/ui/spotlight-card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Crown, 
  Trophy, 
  Medal, 
  Star, 
  Gem, 
  Shield, 
  Sword, 
  Sparkles, 
  ChevronRight,
  Home,
  Zap,
  Target,
  Award,
  Users,
  Github,
  Linkedin
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/simple-auth-client";

interface RankingUser {
  id: string;
  name: string;
  //email: string;
  avatar?: string;
  totalPoints: number;
  completedExercises: number;
  rank?: number;
}

export default function Ranking() {
  const { isAuthenticated, user } = useAuth();

  // Fetch all exercises to calculate total available points
  const { data: exercises, isLoading: exercisesLoading } = useQuery({
    queryKey: ["/api/exercises"],
    staleTime: 5 * 60 * 1000,
    refetchOnMount: true,
    retry: 3,
    retryDelay: 1000,
  });

  // Fetch ranking data
  const { data: rankingData, refetch: refetchRanking, isLoading: rankingLoading } = useQuery({
    queryKey: ["/api/users/ranking"],
    staleTime: 15 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: 1000,
  });

  // Refetch ranking when authentication changes
  useEffect(() => {
    if (isAuthenticated && user) {
      refetchRanking();
    }
  }, [isAuthenticated, user, refetchRanking]);

  const getUserInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
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
      borderColor: "rgba(232, 180, 188, 0.3)",
      glow: "rgba(232, 180, 188, 0.6)"
    };
    if (percentage >= 65) return { 
      name: "Lendário", 
      icon: Star, 
      color: "#FFD700", // Legendary yellow/gold
      bgColor: "rgba(255, 215, 0, 0.15)",
      borderColor: "rgba(255, 215, 0, 0.3)",
      glow: "rgba(255, 215, 0, 0.6)"
    };
    if (percentage >= 49) return { 
      name: "Elite", 
      icon: Gem, 
      color: "#FF8C00", // Epic orange
      bgColor: "rgba(255, 140, 0, 0.15)",
      borderColor: "rgba(255, 140, 0, 0.3)",
      glow: "rgba(255, 140, 0, 0.6)"
    };
    if (percentage >= 33) return { 
      name: "Veterano", 
      icon: Shield, 
      color: "#5E5CFF", // Rare blue
      bgColor: "rgba(94, 92, 255, 0.15)",
      borderColor: "rgba(94, 92, 255, 0.3)",
      glow: "rgba(94, 92, 255, 0.6)"
    };
    if (percentage >= 17) return { 
      name: "Aventureiro", 
      icon: Sword, 
      color: "#50C878", // Uncommon green
      bgColor: "rgba(80, 200, 120, 0.15)",
      borderColor: "rgba(80, 200, 120, 0.3)",
      glow: "rgba(80, 200, 120, 0.6)"
    };
    return { 
      name: "Novato", 
      icon: Sparkles, 
      color: "#C0C0C0", // Common gray
      bgColor: "rgba(192, 192, 192, 0.15)",
      borderColor: "rgba(192, 192, 192, 0.3)",
      glow: "rgba(192, 192, 192, 0.6)"
    };
  };

  // Get position styling based on rank
  const getPositionStyling = (position: number) => {
    if (position === 1) {
      return {
        icon: Award,
        color: "#FFD700",
        bgGradient: "linear-gradient(135deg, #FFD700, #FFA500)",
        shadowColor: "rgba(255, 215, 0, 0.5)",
        borderColor: "#FFD700",
        title: "👑 Campeão"
      };
    }
    if (position === 2) {
      return {
        icon: Award,
        color: "#C0C0C0",
        bgGradient: "linear-gradient(135deg, #C0C0C0, #A8A8A8)",
        shadowColor: "rgba(192, 192, 192, 0.5)",
        borderColor: "#C0C0C0",
        title: "🥈 Vice-Campeão"
      };
    }
    if (position === 3) {
      return {
        icon: Award,
        color: "#CD7F32",
        bgGradient: "linear-gradient(135deg, #CD7F32, #B8860B)",
        shadowColor: "rgba(205, 127, 50, 0.5)",
        borderColor: "#CD7F32",
        title: "🥉 Terceiro Lugar"
      };
    }
    return {
      icon: Target,
      color: "#9d4edd",
      bgGradient: "linear-gradient(135deg, #9d4edd, #7b2cbf)",
      shadowColor: "rgba(157, 78, 221, 0.5)",
      borderColor: "#9d4edd",
      title: `#${position}`
    };
  };

  const rankedUsers = Array.isArray(rankingData) 
    ? rankingData.map((user: any, index: number) => ({
        ...user,
        rank: index + 1
      }))
    : [];

  const currentUserRank = rankedUsers.find((rankedUser: any) => rankedUser.id === user?.id);

  if (rankingLoading || exercisesLoading) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-slate-300">Carregando ranking...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link href="/" className="flex items-center text-slate-400 hover:text-purple-400 transition-colors">
                Início
              </Link>
            </li>
            <ChevronRight className="w-4 h-4 text-slate-600" />
            <li>
              <span className="text-purple-400 font-medium">Ranking dos Aventureiros</span>
            </li>
          </ol>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-4xl font-bold" style={{ color: '#9d4edd', fontFamily: 'var(--font-retro)' }}>
              Hall da Fama
            </h1>
          </div>
          <p className="text-xl" style={{ color: '#fff6e9' }}>
            Os maiores aventureiros do DevQuest
          </p>
        </div>

        {/* Current User Stats */}
        {isAuthenticated && currentUserRank && (
          <div className="mb-8">
            <GlowCard glowColor="purple" customSize={true}>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2" style={{ color: '#9d4edd' }}>
                  <Users className="w-5 h-5" />
                  Sua Posição
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="w-16 h-16 border-2" style={{ borderColor: getUserRank(currentUserRank.totalPoints).color }}>
                        <AvatarImage src={currentUserRank.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUserRank.name}`} />
                        <AvatarFallback className="bg-primary/20 text-foreground text-lg font-bold">
                          {getUserInitials(currentUserRank.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div 
                        className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ 
                          backgroundColor: getPositionStyling(currentUserRank.rank).color,
                          color: 'white',
                          boxShadow: `0 0 10px ${getPositionStyling(currentUserRank.rank).shadowColor}`
                        }}
                      >
                        #{currentUserRank.rank}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold" style={{ color: '#fff6e9' }}>
                        {currentUserRank.name}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge 
                          className="font-bold"
                          style={{ 
                            backgroundColor: getUserRank(currentUserRank.totalPoints).bgColor,
                            color: getUserRank(currentUserRank.totalPoints).color,
                            border: `1px solid ${getUserRank(currentUserRank.totalPoints).borderColor}`,
                          }}
                        >
                          {getUserRank(currentUserRank.totalPoints).name}
                        </Badge>
                        <span className="text-sm flex items-center gap-1" style={{ color: '#fff6e9' }}>
                          <Gem className="w-4 h-4" style={{ color: '#9d4edd' }} />
                          <span className="number">{currentUserRank.totalPoints}</span> XP
                        </span>
                        <span className="text-sm flex items-center gap-1" style={{ color: '#fff6e9' }}>
                          <Zap className="w-4 h-4" style={{ color: '#50C878' }} />
                          <span className="number">{currentUserRank.completedExercises}</span> exercícios
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold number" style={{ color: getPositionStyling(currentUserRank.rank).color }}>
                      #{currentUserRank.rank}
                    </p>
                    <p className="text-sm" style={{ color: '#fff6e9' }}>Posição</p>
                  </div>
                </div>
              </CardContent>
            </GlowCard>
          </div>
        )}

        {/* Top 3 Podium */}
        {rankedUsers.length >= 3 && !exercisesLoading && !rankingLoading && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-center mb-8" style={{ color: '#9d4edd' }}>
              🏆 Pódio dos Campeões
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* 2nd Place */}
              <div className="md:order-1 md:mt-8">
                <GlowCard glowColor="blue" customSize={true}>
                  <div className="relative">
                    <div 
                      className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full text-white font-bold text-sm"
                      style={{ 
                        background: getPositionStyling(2).bgGradient,
                        boxShadow: `0 4px 15px ${getPositionStyling(2).shadowColor}`
                      }}
                    >
                      2º Lugar
                    </div>
                    <CardContent className="pt-8 pb-6 text-center">
                      <div className="relative mb-4">
                        <Avatar className="w-20 h-20 mx-auto border-4" style={{ borderColor: getPositionStyling(2).color }}>
                          <AvatarImage src={rankedUsers[1].avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${rankedUsers[1].name}`} />
                          <AvatarFallback className="text-2xl font-bold bg-primary/20 text-foreground">
                            {getUserInitials(rankedUsers[1].name)}
                          </AvatarFallback>
                        </Avatar>
                        <Award className="absolute -bottom-2 -right-2 w-8 h-8" style={{ color: getPositionStyling(2).color }} />
                      </div>
                      <h3 className="text-lg font-bold mb-2" style={{ color: '#fff6e9' }}>
                        {rankedUsers[1].name}
                      </h3>
                      <Badge 
                        className="mb-3"
                        style={{ 
                          backgroundColor: getUserRank(rankedUsers[1].totalPoints).bgColor,
                          color: getUserRank(rankedUsers[1].totalPoints).color,
                          border: `1px solid ${getUserRank(rankedUsers[1].totalPoints).borderColor}`,
                        }}
                      >
                        {getUserRank(rankedUsers[1].totalPoints).name}
                      </Badge>
                      <p className="text-2xl font-bold number mb-1" style={{ color: getPositionStyling(2).color }}>
                        {rankedUsers[1].totalPoints} XP
                      </p>
                      <p className="text-sm" style={{ color: '#fff6e9' }}>
                        {rankedUsers[1].completedExercises} exercícios completos
                      </p>
                    </CardContent>
                  </div>
                </GlowCard>
              </div>

              {/* 1st Place */}
              <div className="md:order-2">
                <GlowCard glowColor="orange" customSize={true}>
                  <div className="relative">
                    <div 
                      className="absolute -top-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full text-white font-bold"
                      style={{ 
                        background: getPositionStyling(1).bgGradient,
                        boxShadow: `0 6px 20px ${getPositionStyling(1).shadowColor}`
                      }}
                    >
                      CAMPEÃO
                    </div>
                    <CardContent className="pt-10 pb-6 text-center">
                      <div className="relative mb-4">
                        <Avatar className="w-24 h-24 mx-auto border-4" style={{ borderColor: getPositionStyling(1).color }}>
                          <AvatarImage src={rankedUsers[0].avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${rankedUsers[0].name}`} />
                          <AvatarFallback className="text-2xl font-bold bg-primary/20 text-foreground">
                            {getUserInitials(rankedUsers[0].name)}
                          </AvatarFallback>
                        </Avatar>
                        <Award className="absolute -bottom-2 -right-2 w-8 h-8" style={{ color: getPositionStyling(1).color }} />
                      </div>
                      <h3 className="text-xl font-bold mb-2" style={{ color: '#fff6e9' }}>
                        {rankedUsers[0].name}
                      </h3>
                      <Badge 
                        className="mb-3"
                        style={{ 
                          backgroundColor: getUserRank(rankedUsers[0].totalPoints).bgColor,
                          color: getUserRank(rankedUsers[0].totalPoints).color,
                          border: `1px solid ${getUserRank(rankedUsers[0].totalPoints).borderColor}`,
                        }}
                      >
                        {getUserRank(rankedUsers[0].totalPoints).name}
                      </Badge>
                      <p className="text-3xl font-bold number mb-1" style={{ color: getPositionStyling(1).color }}>
                        {rankedUsers[0].totalPoints} XP
                      </p>
                      <p className="text-sm" style={{ color: '#fff6e9' }}>
                        {rankedUsers[0].completedExercises} exercícios completos
                      </p>
                    </CardContent>
                  </div>
                </GlowCard>
              </div>

              {/* 3rd Place */}
              <div className="md:order-3 md:mt-8">
                <GlowCard glowColor="red" customSize={true}>
                  <div className="relative">
                    <div 
                      className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full text-white font-bold text-sm"
                      style={{ 
                        background: getPositionStyling(3).bgGradient,
                        boxShadow: `0 4px 15px ${getPositionStyling(3).shadowColor}`
                      }}
                    >
                      3º Lugar
                    </div>
                    <CardContent className="pt-8 pb-6 text-center">
                      <div className="relative mb-4">
                        <Avatar className="w-20 h-20 mx-auto border-4" style={{ borderColor: getPositionStyling(3).color }}>
                          <AvatarImage src={rankedUsers[2].avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${rankedUsers[2].name}`} />
                          <AvatarFallback className="text-2xl font-bold bg-primary/20 text-foreground">
                            {getUserInitials(rankedUsers[2].name)}
                          </AvatarFallback>
                        </Avatar>
                        <Award className="absolute -bottom-2 -right-2 w-8 h-8" style={{ color: getPositionStyling(3).color }} />
                      </div>
                      <h3 className="text-lg font-bold mb-2" style={{ color: '#fff6e9' }}>
                        {rankedUsers[2].name}
                      </h3>
                      <Badge 
                        className="mb-3"
                        style={{ 
                          backgroundColor: getUserRank(rankedUsers[2].totalPoints).bgColor,
                          color: getUserRank(rankedUsers[2].totalPoints).color,
                          border: `1px solid ${getUserRank(rankedUsers[2].totalPoints).borderColor}`,
                        }}
                      >
                        {getUserRank(rankedUsers[2].totalPoints).name}
                      </Badge>
                      <p className="text-2xl font-bold number mb-1" style={{ color: getPositionStyling(3).color }}>
                        {rankedUsers[2].totalPoints} XP
                      </p>
                      <p className="text-sm" style={{ color: '#fff6e9' }}>
                        {rankedUsers[2].completedExercises} exercícios completos
                      </p>
                    </CardContent>
                  </div>
                </GlowCard>
              </div>
            </div>
          </div>
        )}

        {/* Full Ranking List */}
        <div>
          <h2 className="text-2xl font-bold text-center mb-8" style={{ color: '#9d4edd' }}>
            Ranking Completo
          </h2>
          
          <div className="space-y-4">
            {rankedUsers.map((rankedUser: any, index: number) => {
              const position = index + 1;
              const positionStyle = getPositionStyling(position);
              const userRank = getUserRank(rankedUser.totalPoints);
              const isCurrentUser = rankedUser.id === user?.id;
              
              return (
                <GlowCard 
                  key={rankedUser.id} 
                  glowColor={isCurrentUser ? "purple" : "blue"} 
                  customSize={true}
                  className={`transition-all duration-200 ${isCurrentUser ? 'ring-2 ring-purple-500 scale-[1.02]' : 'hover:scale-[1.01]'}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Position */}
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white"
                          style={{ 
                            background: positionStyle.bgGradient,
                            boxShadow: `0 4px 15px ${positionStyle.shadowColor}`
                          }}
                        >
                          {position <= 3 ? (
                            <positionStyle.icon className="w-6 h-6" />
                          ) : (
                            position
                          )}
                        </div>

                        {/* User Info */}
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <Avatar className="w-14 h-14 border-2" style={{ borderColor: userRank.color }}>
                              <AvatarImage src={rankedUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${rankedUser.name}`} />
                              <AvatarFallback className="text-lg font-bold bg-primary/20 text-foreground">
                                {getUserInitials(rankedUser.name)}
                              </AvatarFallback>
                            </Avatar>
                            {isCurrentUser && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                                <Star className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-bold" style={{ color: '#fff6e9' }}>
                                {rankedUser.name}
                                {isCurrentUser && (
                                  <span className="ml-2 text-sm font-normal text-purple-400">(Você)</span>
                                )}
                              </h3>
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              <Badge 
                                className="font-medium text-xs"
                                style={{ 
                                  backgroundColor: userRank.bgColor,
                                  color: userRank.color,
                                  border: `1px solid ${userRank.borderColor}`,
                                }}
                              >
                                <userRank.icon className="w-3 h-3 mr-1" />
                                {userRank.name}
                              </Badge>
                              
                              <div className="flex items-center gap-3 text-sm">
                                <span className="flex items-center gap-1" style={{ color: '#fff6e9' }}>
                                  <Gem className="w-4 h-4" style={{ color: '#9d4edd' }} />
                                  <span className="number font-medium">{rankedUser.totalPoints}</span> XP
                                </span>
                                <span className="flex items-center gap-1" style={{ color: '#fff6e9' }}>
                                  <Zap className="w-4 h-4" style={{ color: '#50C878' }} />
                                  <span className="number font-medium">{rankedUser.completedExercises}</span> exercícios
                                </span>
                              </div>
                              
                              {/* Social Links */}
                              {(rankedUser.github || rankedUser.linkedin) && (
                                <div className="flex items-center gap-2 mt-2">
                                  {rankedUser.github && (
                                    <a 
                                      href={rankedUser.github.startsWith('http') ? rankedUser.github : `https://github.com/${rankedUser.github}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1 rounded-full hover:bg-gray-700 transition-colors"
                                      title="GitHub"
                                    >
                                      <Github className="w-4 h-4 text-gray-400 hover:text-white" />
                                    </a>
                                  )}
                                  {rankedUser.linkedin && (
                                    <a 
                                      href={rankedUser.linkedin.startsWith('http') ? rankedUser.linkedin : `https://linkedin.com/in/${rankedUser.linkedin}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1 rounded-full hover:bg-gray-700 transition-colors"
                                      title="LinkedIn"
                                    >
                                      <Linkedin className="w-4 h-4 text-blue-400 hover:text-blue-300" />
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Progress Percentage */}
                      <div className="text-right">
                        <div className="text-lg font-bold number mb-1" style={{ color: userRank.color }}>
                          {totalAvailablePoints > 0 ? Math.round((rankedUser.totalPoints / totalAvailablePoints) * 100) : 0}%
                        </div>
                        <div className="text-xs" style={{ color: '#fff6e9', opacity: 0.7 }}>
                          progresso
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </GlowCard>
              );
            })}
          </div>
        </div>

        {/* Empty State */}
        {rankedUsers.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 mx-auto mb-4" style={{ color: '#9d4edd' }} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#9d4edd' }}>
              Nenhum aventureiro encontrado
            </h3>
            <p style={{ color: '#fff6e9', opacity: 0.8 }}>
              Seja o primeiro a completar exercícios e aparecer no ranking!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}