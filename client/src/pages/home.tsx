import { Link } from "wouter";
import { Header } from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlowCard } from "@/components/ui/spotlight-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Code, Palette, Zap, Trophy, Star, ArrowRight, Sparkles, Play } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/simple-auth-client";
import { useEffect } from "react";
import type { Exercise } from "@shared/schema";

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  // Fetch exercises from API
  const { data: exercises, isLoading: exercisesLoading } = useQuery({
    queryKey: ["/api/exercises"],
    staleTime: 5 * 60 * 1000,
    refetchOnMount: true,
    retry: 3,
    retryDelay: 1000,
  });

  // Fetch user progress from API
  const { data: progress, refetch: refetchProgress, isLoading: progressLoading } = useQuery({
    queryKey: ["/api/progress"],
    enabled: !!isAuthenticated,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 3,
    retryDelay: 1000,
  });

  // Refetch progress when authentication changes
  useEffect(() => {
    if (isAuthenticated && user) {
      refetchProgress();
    }
  }, [isAuthenticated, user, refetchProgress]);

  // Calculate stats for each category
  const getCategoryStats = (categoryId: string) => {
    const categoryExercises = Array.isArray(exercises) 
      ? exercises.filter((ex: Exercise) => ex.category === categoryId)
      : [];
    
    const completedProgress = Array.isArray(progress) 
      ? progress.filter((p: any) => 
          p.completed && categoryExercises.some((ex: Exercise) => ex.id === p.exerciseId)
        )
      : [];

    return {
      total: categoryExercises.length,
      completed: completedProgress.length
    };
  };

  const categories = [
    {
      id: "html",
      title: "HTML",
      description: "Estrutura e semântica web",
      icon: Code,
      color: "#e34c26",
      bgColor: "rgba(227, 76, 38, 0.1)",
      ...getCategoryStats("html"),
      href: "/exercises/html"
    },
    {
      id: "css",
      title: "CSS",
      description: "Estilização e design visual",
      icon: Palette,
      color: "#1572b6",
      bgColor: "rgba(21, 114, 182, 0.1)",
      ...getCategoryStats("css"),
      href: "/exercises/css"
    },
    {
      id: "javascript",
      title: "JavaScript",
      description: "Interatividade e lógica",
      icon: Zap,
      color: "#f7df1e",
      bgColor: "rgba(247, 223, 30, 0.1)",
      ...getCategoryStats("javascript"),
      href: "/exercises/javascript"
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="mb-8">
            <span className="relative overflow-hidden inline-block bg-[#1a1a1a] border border-gray-700 text-[#0CF2A0] px-4 py-1 rounded-full text-xs sm:text-sm font-medium cursor-pointer hover:border-[#0CF2A0]/50 transition-colors">
              ✨ Powered by DevQuest AI
              <span style={{ position: 'absolute', inset: '0px', background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)', animation: '2s linear 0s infinite normal none running shine', opacity: 0.5, pointerEvents: 'none' }}></span>
            </span>
          </div>
          <div className="flex flex-col items-center justify-center" style={{ marginBottom: '1rem' }}>
            <img src="/avatars/logo.png" alt="CodeQuest Logo" className="h-40 w-auto" />
            {/* <h1 className="text-4xl font-bold" style={{ color: '#9d4edd', fontFamily: 'var(--font-retro)' }}>
              CodeQuest
            </h1> */}
          </div>
          <div className="max-w-3xl mx-auto">
            <p style={{ color: 'white', fontFamily: 'Inter,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif', fontSize: '1.7rem', lineHeight: '2.1rem', fontWeight: '300' }}>
              Domine programação web com desafios práticos, feedback inteligente por IA e experiência de aprendizado personalizada para o seu ritmo.
            </p>
            <div className="flex justify-center mt-8">
              <Button 
                className="rpg-button" 
                size="lg"
                onClick={() => {
                  const element = document.getElementById('categorias');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Play className="w-5 h-5 mr-2" />
                Começar Aventura
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <GlowCard glowColor="purple" customSize={true}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: '#fff6e9', opacity: 0.8 }}>Total de Exercícios</p>
                  <p className="text-3xl font-bold number" style={{ color: '#9d4edd' }}>47</p>
                </div>
                <Trophy className="w-8 h-8" style={{ color: '#9d4edd' }} />
              </div>
            </CardContent>
          </GlowCard>

          <GlowCard glowColor="purple" customSize={true}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: '#fff6e9', opacity: 0.8 }}>Pontos Disponíveis</p>
                  <p className="text-3xl font-bold number" style={{ color: '#9d4edd' }}>1500</p>
                </div>
                <Star className="w-8 h-8" style={{ color: '#9d4edd' }} />
              </div>
            </CardContent>
          </GlowCard>

          <GlowCard glowColor="purple" customSize={true}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: '#fff6e9', opacity: 0.8 }}>Categorias</p>
                  <p className="text-3xl font-bold number" style={{ color: '#9d4edd' }}>3</p>
                </div>
                <Code className="w-8 h-8" style={{ color: '#9d4edd' }} />
              </div>
            </CardContent>
          </GlowCard>
        </div> */}

        {/* Categories Section */}
        <div id="categorias" style={{ paddingTop: '4rem' }}>
          <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: '#9d4edd' }}>
            Escolha uma categoria para começar
          </h2>

          <div className="max-w-2xl mx-auto" style={{ marginBottom: '2rem' }}>
            <p style={{ color: 'white', fontFamily: 'Inter,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif', fontSize: '1.1rem', lineHeight: '1.75rem', fontWeight: '300', textAlign: 'center' }}>
              Bem-vindo(a) Aventureiro(a)! Desbloqueie conquistas, colete pontos de experiência e evolua do Novato ao Dev Lendário através de desafios práticos de programação.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <GlowCard key={category.id} glowColor="purple" customSize={true}>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: category.bgColor }}
                      >
                        <Icon className="w-6 h-6" style={{ color: category.color }} />
                      </div>
                      <Badge variant="outline" style={{ color: '#9d4edd', borderColor: '#9d4edd' }} className="number">
                        {progressLoading || exercisesLoading ? (
                          <span className="animate-pulse">--/--</span>
                        ) : (
                          `${category.completed}/${category.total}`
                        )}
                      </Badge>
                    </div>
                    <CardTitle style={{ color: '#fff6e9' }}>{category.title}</CardTitle>
                    <CardDescription style={{ color: '#fff6e9', opacity: 0.8 }}>
                      {category.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Progress Section */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium" style={{ color: '#fff6e9' }}>
                          Progresso
                        </span>
                        <span className="text-sm number" style={{ color: '#9d4edd' }}>
                          {progressLoading || exercisesLoading ? (
                            <span className="animate-pulse">--%</span>
                          ) : (
                            `${category.total > 0 ? Math.round((category.completed / category.total) * 100) : 0}%`
                          )}
                        </span>
                      </div>
                      <div className="relative h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: 'rgba(75, 85, 99, 0.3)' }}>
                        <div 
                          className={`h-full transition-all duration-300 ${progressLoading || exercisesLoading ? 'animate-pulse' : ''}`}
                          style={{ 
                            width: progressLoading || exercisesLoading 
                              ? '20%' 
                              : `${category.total > 0 ? (category.completed / category.total) * 100 : 0}%`,
                            backgroundColor: progressLoading || exercisesLoading 
                              ? 'rgba(157, 78, 221, 0.4)' 
                              : '#9d4edd'
                          }}
                        />
                      </div>
                    </div>
                    <Link href={category.href}>
                      <Button className="w-full rpg-button">
                        Começar
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </GlowCard>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        {/* <div className="mt-12 text-center">
          <Card className="border-2" style={{ borderColor: '#9d4edd', backgroundColor: 'rgba(157, 78, 221, 0.05)' }}>
            <CardContent className="py-8">
              <h3 className="text-xl font-bold mb-2" style={{ color: '#9d4edd' }}>
                Pronto para começar sua jornada?
              </h3>
              <p className="mb-4" style={{ color: '#fff6e9', opacity: 0.8 }}>
                Escolha uma categoria acima e comece a resolver exercícios para ganhar pontos!
              </p>
              <Link href="/exercises/html">
                <Button size="lg" className="rpg-button">
                  <Code className="w-5 h-5 mr-2" />
                  Começar com HTML
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div> */}
      </div>
    </div>
  );
}