import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Header } from "@/components/header";
import { useAuth } from "@/lib/simple-auth-client";
import { useMemo } from "react";
import { queryKeys } from "@/lib/queryKeys";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlowCard } from "@/components/ui/spotlight-card";
import { HyperText } from "@/components/ui/hyper-text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sword, Shield, Zap, Star, Trophy, ArrowRight, Crown, Gem, Sparkles, Scroll, Code } from "lucide-react";
import type { Exercise } from "@shared/schema";

export default function Categories() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Memoized query keys for stable references
  const exercisesQueryKey = useMemo(() => queryKeys.exercises(), []);
  const progressQueryKey = useMemo(() => queryKeys.progress(), []);
  
  const { data: exercises, isLoading } = useQuery({
    queryKey: exercisesQueryKey,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!isAuthenticated && !authLoading,
    select: (data) => data || [],
    placeholderData: [],
  });

  const { data: progress } = useQuery({
    queryKey: progressQueryKey,
    staleTime: 2 * 60 * 1000, // 2 minutes - progress needs more frequent updates
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!isAuthenticated && !authLoading,
    select: (data) => data || [],
    placeholderData: [],
  });

  const completedExercises = progress?.filter((p: any) => p.completed) || [];

  // Calculate stats for each category
  const getCategoryStats = (category: string) => {
    const categoryExercises = exercises?.filter((ex: Exercise) => ex.category === category) || [];
    const completed = completedExercises.filter((p: any) => 
      categoryExercises.some((ex: Exercise) => ex.id === p.exerciseId)
    ).length;
    const totalPoints = categoryExercises.reduce((total: number, ex: Exercise) => total + ex.points, 0);
    
    return {
      total: categoryExercises.length,
      completed,
      percentage: categoryExercises.length > 0 ? Math.round((completed / categoryExercises.length) * 100) : 0,
      totalPoints
    };
  };

  const htmlStats = getCategoryStats("html");
  const cssStats = getCategoryStats("css");
  const jsStats = getCategoryStats("javascript");

  const guilds = [
    {
      id: "html",
      name: "Exercícios HTML",
      title: "🔥 Construtores de Estruturas",
      description: "Domine as artes fundamentais da construção web",
      icon: Sword,
      color: "guild-html",
      guildColor: "from-purple-500 to-purple-600",
      textColor: "text-orange-200",
      route: "/exercises/html",
      stats: htmlStats,
      lore: "Os mestres construtores que erguem as fundações do reino digital"
    },
    {
      id: "css",
      name: "Exercícios CSS",
      title: "🛡️ Artistas da Estilização", 
      description: "Transforme estruturas em obras de arte visual",
      icon: Shield,
      color: "guild-css",
      guildColor: "from-purple-500 to-purple-600",
      textColor: "text-cyan-200",
      route: "/exercises/css",
      stats: cssStats,
      lore: "Os encantadores que dão vida e beleza às criações"
    },
    {
      id: "javascript",
      name: "Exercícios JavaScript",
      title: "⚡ Magos da Interatividade",
      description: "Invoque poderes mágicos de interação e lógica",
      icon: Zap,
      color: "guild-js",
      guildColor: "from-purple-500 to-purple-600",
      textColor: "text-yellow-200",
      route: "/exercises/javascript",
      stats: jsStats,
      lore: "Os feiticeiros que concedem inteligência às criações"
    }
  ];

  // Get user rank for display
  const getUserRank = (xp: number) => {
    if (xp >= 1000) return { name: "Lenda", icon: Crown, color: "text-yellow-200" };
    if (xp >= 500) return { name: "Mestre", icon: Gem, color: "text-purple-300" };
    if (xp >= 200) return { name: "Expert", icon: Star, color: "text-blue-300" };
    return { name: "Aprendiz", icon: Sparkles, color: "text-green-300" };
  };

  const totalXP = completedExercises.reduce((total: number, progress: any) => total + (progress.pointsEarned || 0), 0);
  const userRank = getUserRank(totalXP);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          {/* Badge Section */}
          <div className="mb-6 flex justify-center">
            <span className="relative overflow-hidden inline-block bg-[#1a1a1a] border border-gray-700 text-[#0CF2A0] px-3 py-0.5 rounded-full text-[10px] sm:text-xs font-medium cursor-pointer hover:border-[#0CF2A0]/50 transition-colors" style={{ fontFamily: 'var(--font-inter)' }}>
              ✨ Powered by DevQuest AI
              <span 
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                  animation: 'shine 2s linear infinite',
                  opacity: 0.5,
                  pointerEvents: 'none'
                }}
              />
              <style>
                {`
                  @keyframes shine {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                  }
                `}
              </style>
            </span>
          </div>
          
          <div className="mb-8 flex justify-center items-center group">
            <div style={{ fontFamily: 'var(--font-retro)' }}>
              <h1 className="text-3xl lg:text-4xl text-white font-bold">Plataforma de Exercícios</h1>
            </div>
          </div>
          <div className="relative mb-6">
            <p className="relative z-10 text-lg max-w-[500px] mx-auto leading-relaxed" style={{ fontFamily: 'var(--font-inter)', color: 'rgb(156, 163, 175)' }}>
              Pratique programação com exercícios interativos e conquiste pontos para se tornar um dev lendário
            </p>
          </div>
          
          {/* Enhanced decoration */}
          <div className="flex justify-center items-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent w-32"></div>
            <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent w-32"></div>
          </div>
          
          {/* User Stats Banner */}
          {/* <div className="fantasy-card max-w-2xl mx-auto p-6 mb-8">
            <div className="flex items-center justify-center space-x-6">
              <div className="flex items-center space-x-2">
                <userRank.icon className="w-6 h-6" style={{ color: '#fff6e9' }} />
                <span className="text-sm font-bold" style={{ color: '#fff6e9' }}>Nível atual: {userRank.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Gem className="w-5 h-5" style={{ color: '#fff6e9' }} />
                <span className="text-lg font-bold" style={{ color: '#fff6e9' }}><span className="number">{totalXP}</span> XP</span>
              </div>
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5" style={{ color: '#fff6e9' }} />
                <span className="text-lg font-bold" style={{ color: '#fff6e9' }}><span className="number">{completedExercises.length}</span> Quests</span>
              </div>
            </div>
          </div> */}
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <GlowCard 
            glowColor="blue" 
            customSize={true}
            className="flex flex-col min-h-[150px]"
          >
            <div className="flex items-center space-x-4 h-full">
              <div className="p-3 rounded-xl bg-blue-500/20">
                <Trophy className="w-8 h-8 text-blue-300" />
              </div>
              <div>
                <p className="text-sm text-slate-300" style={{ fontFamily: 'var(--font-inter)' }}>Total de Exercícios</p>
                <p className="text-3xl font-bold text-white number">
                  {exercises?.length || 0}
                </p>
              </div>
            </div>
          </GlowCard>

          <GlowCard 
            glowColor="green" 
            customSize={true}
            className="flex flex-col min-h-[150px]"
          >
            <div className="flex items-center space-x-4 h-full">
              <div className="p-3 rounded-xl bg-green-500/20">
                <Star className="w-8 h-8 text-green-300" />
              </div>
              <div>
                <p className="text-sm text-slate-300" style={{ fontFamily: 'var(--font-inter)' }}>Exercícios Completados</p>
                <p className="text-3xl font-bold text-white number">
                  {completedExercises.length}
                </p>
              </div>
            </div>
          </GlowCard>

          <GlowCard 
            glowColor="purple" 
            customSize={true}
            className="flex flex-col min-h-[150px]"
          >
            <div className="flex items-center space-x-4 h-full">
              <div className="p-3 rounded-xl bg-purple-500/20">
                <Code className="w-8 h-8 text-purple-300" />
              </div>
              <div>
                <p className="text-sm text-slate-300" style={{ fontFamily: 'var(--font-inter)' }}>Pontos Disponíveis</p>
                <p className="text-3xl font-bold text-white number">
                  {exercises?.reduce((total: number, ex: Exercise) => total + ex.points, 0) || 0}
                </p>
              </div>
            </div>
          </GlowCard>
        </div>

        {/* Guild Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {guilds.map((guild, index) => (
            <GlowCard 
              key={guild.id}
              glowColor={index === 0 ? "orange" : index === 1 ? "blue" : "green"}
              customSize={true}
              className="flex flex-col min-h-[500px]"
            >
              <div className="flex flex-col h-full" style={{ gap: 30}}>
                {/* Header */}
                <div className="text-center pb-4 mb-4">
                  <div className={`w-20 h-20 bg-gradient-to-br ${guild.guildColor} rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl`}>
                    <guild.icon className="text-white w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-inter)' }}>
                    {guild.name}
                  </h3>
                </div>

                <div className="flex-1 space-y-4">
                  {/* XP Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-slate-300" style={{ fontFamily: 'var(--font-inter)' }}>
                      <span>Progresso</span>
                      <span><span className="number">{guild.stats.percentage}</span>% Completo</span>
                    </div>
                    <div className="w-full bg-black/30 rounded-full h-3 border border-white/20">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${guild.stats.percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Guild Stats */}
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-black/20 rounded-lg p-3 border border-white/10">
                      <div className="text-2xl font-bold text-white number">
                        {guild.stats.completed}
                      </div>
                      <div className="text-xs text-slate-300" style={{ fontFamily: 'var(--font-inter)' }}>Exercícios Completos</div>
                    </div>
                    <div className="bg-black/20 rounded-lg p-3 border border-white/10">
                      <div className="text-2xl font-bold text-white number">
                        {guild.stats.total}
                      </div>
                      <div className="text-xs text-slate-300" style={{ fontFamily: 'var(--font-inter)' }}>Total de Exercícios</div>
                    </div>
                  </div>

                  {/* XP Treasure */}
                  <div className="flex items-center justify-center space-x-2 bg-amber-500/20 rounded-lg p-3 border border-amber-400/30 mb-20" style={{marginBottom: 20}}>
                    <Gem className="w-5 h-5 text-amber-300" />
                    <span className="text-sm font-bold text-amber-200" style={{ fontFamily: 'var(--font-inter)' }}>
                      Até <span className="number">{guild.stats.totalPoints}</span> XP para conquistar
                    </span>
                  </div>

                  {/* Enter Guild Button */}
                  <Link href={guild.route}>
                    <Button className="w-full rpg-button group">
                      <Scroll className="mr-2 w-4 h-4" />
                      Exercícios
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            </GlowCard>
          ))}
        </div>

        {/* Hall of Fame - Overall Progress */}
        {/* <GlowCard 
          glowColor="red" 
          customSize={true}
          className="flex flex-col min-h-[400px] w-full"
        >
          <div className="flex flex-col h-full">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-inter)' }}>🏆 Salão da Fama</h2>
              <p className="text-lg text-slate-300" style={{ fontFamily: 'var(--font-inter)' }}>Suas conquistas épicas através dos reinos do código</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              
              <div className="text-center">
                <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full mx-auto mb-4 shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 cursor-pointer">
                  <Trophy className="w-10 h-10 transition-colors duration-300 text-white" />
                </div>
                <div className="text-3xl font-bold text-white number">
                  {completedExercises.length}
                </div>
                <div className="text-slate-300" style={{ fontFamily: 'var(--font-inter)' }}>Quests Concluídas</div>
              </div>

              
              <div className="text-center">
                <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4 shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 cursor-pointer">
                  <Gem className="w-10 h-10 transition-colors duration-300 text-white" />
                </div>
                <div className="text-3xl font-bold text-white number">
                  {totalXP}
                </div>
                <div className="text-slate-300" style={{ fontFamily: 'var(--font-inter)' }}>XP Total Conquistado</div>
              </div>

              
              <div className="text-center">
                <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mx-auto mb-4 shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 cursor-pointer">
                  <userRank.icon className="w-10 h-10 transition-colors duration-300 text-white" />
                </div>
                <div className="text-3xl font-bold text-white">
                  {userRank.name}
                </div>
                <div className="text-slate-300" style={{ fontFamily: 'var(--font-inter)' }}>Rank Atual</div>
              </div>

             
              <div className="text-center">
                <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mx-auto mb-4 shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 cursor-pointer">
                  <Sword className="w-10 h-10 transition-colors duration-300 text-white" />
                </div>
                <div className="text-3xl font-bold text-white">3</div>
                <div className="text-slate-300" style={{ fontFamily: 'var(--font-inter)' }}>Exercícios Ativos</div>
              </div>
            </div>

           
            <div className="flex-1 text-center">
              <h3 className="text-xl font-bold mb-4 text-white" style={{ fontFamily: 'var(--font-inter)' }}>📈 Progresso para próximo rank</h3>
              <div className="max-w-md mx-auto">
                {userRank.name === "Lenda" ? (
                  <p className="font-bold text-amber-300">🎉 Você já alcançou o rank máximo!</p>
                ) : (
                  <>
                    <div className="flex justify-between text-sm mb-2 text-slate-300">
                      <span>{userRank.name}</span>
                      <span>
                        {userRank.name === "Aprendiz" ? "Expert (200 XP)" :
                         userRank.name === "Expert" ? "Mestre (500 XP)" :
                         "Lenda (1000 XP)"}
                      </span>
                    </div>
                    <div className="w-full bg-black/30 rounded-full h-4">
                      <div 
                        className="bg-gradient-to-r from-red-500 to-orange-500 h-4 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.min(100, (totalXP / (userRank.name === "Aprendiz" ? 200 : userRank.name === "Expert" ? 500 : 1000)) * 100)}%` 
                        }}
                      ></div>
                    </div>
                    <p className="text-sm mt-2 text-slate-300">
                      {userRank.name === "Aprendiz" ? 200 - totalXP : 
                       userRank.name === "Expert" ? 500 - totalXP : 
                       1000 - totalXP} XP restantes para próximo rank
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </GlowCard> */}
      </main>
    </div>
  );
}