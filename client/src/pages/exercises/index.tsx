import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Header } from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlowCard } from "@/components/ui/spotlight-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Code, Palette, Zap, Play, Star, Trophy, CheckCircle2, Home, ChevronRight, Gem, ChevronLeft, ChevronRight as ChevronRightIcon } from "lucide-react";
import type { Exercise } from "@shared/schema";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/simple-auth-client";

const categoryConfig = {
  html: {
    title: "HTML",
    description: "Aprenda HTML através de exercícios práticos",
    icon: Code,
    color: "#e34c26",
    bgColor: "rgba(227, 76, 38, 0.1)",
  },
  css: {
    title: "CSS", 
    description: "Domine estilização e layouts com CSS",
    icon: Palette,
    color: "#1572b6",
    bgColor: "rgba(21, 114, 182, 0.1)",
  },
  javascript: {
    title: "JavaScript",
    description: "Adicione interatividade com JavaScript",
    icon: Zap,
    color: "#f7df1e",
    bgColor: "rgba(247, 223, 30, 0.1)",
  },
};

export default function Exercises() {
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();
  const params = useParams();
  const category = params.category as keyof typeof categoryConfig;
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const exercisesPerPage = 10;
  
  // Redirect to home if invalid category
  if (!category || !categoryConfig[category]) {
    window.location.href = "/";
    return null;
  }

  const config = categoryConfig[category];
  const Icon = config.icon;
  
  // Build query params for server-side filtering
  const queryParams = new URLSearchParams({
    category: category,
    ...(selectedDifficulty !== 'all' && { difficulty: selectedDifficulty })
  }).toString();

  const { data: exercises, isLoading: exercisesLoading } = useQuery({
    queryKey: ["/api/exercises", category, selectedDifficulty],
    queryFn: () => fetch(`/api/exercises?${queryParams}`).then(res => res.json()),
    staleTime: 5 * 60 * 1000, // 5 minutes for exercises
    refetchOnMount: true,
    retry: 3,
    retryDelay: 1000,
  });

  // Get ALL exercises for the category (unfiltered) for stats
  const { data: allCategoryExercises, isLoading: allExercisesLoading } = useQuery({
    queryKey: ["/api/exercises", category, "all-for-stats"],
    queryFn: () => fetch(`/api/exercises?category=${category}`).then(res => res.json()),
    staleTime: 5 * 60 * 1000, // 5 minutes for exercises
    refetchOnMount: true,
    retry: 3,
    retryDelay: 1000,
  });

  const { data: progress, refetch: refetchProgress, isLoading: progressLoading } = useQuery({
    queryKey: ["/api/progress"],
    enabled: !!isAuthenticated,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 3,
    retryDelay: 1000,
  });

  // Refresh data when component mounts or user returns to the page
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
  }, [queryClient]);

  // Refetch progress when authentication changes
  useEffect(() => {
    if (isAuthenticated && user) {
      refetchProgress();
    }
  }, [isAuthenticated, user, refetchProgress]);

  // Exercises are already filtered by server
  const filteredExercises = Array.isArray(exercises) ? exercises : [];
  
  // All exercises for the category (for stats)
  const allExercisesForStats = Array.isArray(allCategoryExercises) ? allCategoryExercises : [];
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredExercises.length / exercisesPerPage);
  const startIndex = (currentPage - 1) * exercisesPerPage;
  const endIndex = startIndex + exercisesPerPage;
  const paginatedExercises = filteredExercises.slice(startIndex, endIndex);
  
  const completedExercises = Array.isArray(progress) ? progress.filter((p: any) => p.completed) : [];
  
  // Stats should be based on ALL exercises in the category, not filtered ones
  const totalCompleted = completedExercises.filter((p: any) => 
    allExercisesForStats.some((ex: Exercise) => ex.id === p.exerciseId)
  ).length;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "iniciante": return "bg-green-100 text-green-800";
      case "intermediario": return "bg-yellow-100 text-yellow-800";
      case "intermediário": return "bg-yellow-100 text-yellow-800"; // fallback para com acento
      case "avançado": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const isExerciseCompleted = (exerciseId: string) => {
    return completedExercises.some((p: any) => p.exerciseId === exerciseId && p.completed);
  };

  if (exercisesLoading || allExercisesLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link href="/" className="flex items-center text-slate-400 hover:text-purple-400 transition-colors">
                Início
              </Link>
            </li>
            <ChevronRight className="w-4 h-4 text-slate-600" />
            <li>
              <span className="text-purple-400 font-medium">Exercícios {config.title}</span>
            </li>
          </ol>
        </nav>

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-6 mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-3" style={{ color: '#9d4edd' }}>Exercícios {config.title}</h1>
              <p style={{ color: '#fff6e9' }}>{config.description}</p>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <GlowCard glowColor="purple" customSize={true} className="h-full">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5" style={{ color: '#9d4edd' }} />
                  <div>
                    <p className="text-sm" style={{ color: '#fff6e9' }}>Exercícios Completados</p>
                    <p className="text-2xl font-bold number" style={{ color: '#9d4edd' }}>
                      {progressLoading || allExercisesLoading ? (
                        <span className="animate-pulse">--/--</span>
                      ) : (
                        `${totalCompleted}/${allExercisesForStats.length}`
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </GlowCard>

            <GlowCard glowColor="purple" customSize={true} className="h-full">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Gem className="w-5 h-5" style={{ color: '#9d4edd' }} />
                  <div>
                    <p className="text-sm" style={{ color: '#fff6e9' }}>Pontos Disponíveis</p>
                    <p className="text-2xl font-bold number" style={{ color: '#9d4edd' }}>
                      {allExercisesLoading ? (
                        <span className="animate-pulse">----</span>
                      ) : (
                        allExercisesForStats.reduce((total: number, ex: Exercise) => total + ex.points, 0)
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </GlowCard>

            <GlowCard glowColor="purple" customSize={true} className="h-full">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Icon className="w-5 h-5" style={{ color: '#9d4edd' }} />
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm" style={{ color: '#fff6e9' }}>Progresso</p>
                      <span className="text-sm font-medium ml-4" style={{ color: '#9d4edd' }}>
                        {progressLoading || allExercisesLoading ? (
                          <span className="animate-pulse">--%</span>
                        ) : (
                          `${allExercisesForStats.length > 0 ? Math.round((totalCompleted / allExercisesForStats.length) * 100) : 0}%`
                        )}
                      </span>
                    </div>
                    <div className="mt-1">
                      <div className="relative h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: 'rgba(75, 85, 99, 0.3)' }}>
                        <div 
                          className={`h-full transition-all duration-300 ${progressLoading || allExercisesLoading ? 'animate-pulse' : ''}`}
                          style={{ 
                            width: progressLoading || allExercisesLoading 
                              ? '25%' 
                              : `${allExercisesForStats.length > 0 ? (totalCompleted / allExercisesForStats.length) * 100 : 0}%`,
                            backgroundColor: progressLoading || allExercisesLoading 
                              ? 'rgba(157, 78, 221, 0.4)' 
                              : '#9d4edd'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </GlowCard>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(157, 78, 221, 0.3)' }}>
          <div className="flex items-center space-x-4">
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: '#fff6e9' }}>
                Filtrar por dificuldade
              </label>
              <Select value={selectedDifficulty} onValueChange={(value) => {
                setSelectedDifficulty(value);
                setCurrentPage(1); // Reset to first page when filtering
              }}>
                <SelectTrigger className="w-48 bg-white/90 border-gray-300 hover:bg-white focus:bg-white text-gray-800 font-medium">
                  <SelectValue placeholder="Todas as dificuldades" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 shadow-lg">
                  <SelectItem value="all" className="text-gray-800 hover:bg-gray-100">
                    <div className="flex items-center space-x-2">
                      <span>Todas as dificuldades</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="iniciante" className="text-gray-800 hover:bg-green-50">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span>Iniciante</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="intermediario" className="text-gray-800 hover:bg-yellow-50">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span>Intermediário</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="avançado" className="text-gray-800 hover:bg-red-50">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span>Avançado</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="text-sm px-3 py-2 rounded-md" style={{ color: '#fff6e9', backgroundColor: 'rgba(157, 78, 221, 0.2)' }}>
            Mostrando {startIndex + 1}-{Math.min(endIndex, filteredExercises.length)} de {filteredExercises.length} exercícios
          </div>
        </div>

        {/* Exercises Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedExercises.map((exercise: Exercise) => {
            const isCompleted = isExerciseCompleted(exercise.id);
            
            return (
              <GlowCard 
                key={exercise.id} 
                glowColor={isCompleted ? "green" : "purple"}
                customSize={true}
                className={`transition-all hover:shadow-lg ${
                  isCompleted ? 'ring-2 ring-green-500 border-2 border-green-500' : ''
                } h-full`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-md flex items-center number" style={{ color: '#9d4edd' }}>
                        {exercise.title}
                        {isCompleted && (
                          <CheckCircle2 className="w-5 h-5 text-green-600 ml-2" />
                        )}
                      </CardTitle>
                      <CardDescription className="!mt-4" style={{ color: '#fff6e9' }}>
                        {exercise.description}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between !mt-4 pt-4">
                    <Badge className={`${getDifficultyColor(exercise.difficulty)} pointer-events-none`}>
                      {exercise.difficulty}
                    </Badge>
                    <div className="flex items-center text-sm number" style={{ color: '#fff6e9' }}>
                      <Gem className="w-4 h-4 mr-1 " style={{ color: '#9d4edd' }} />
                      {exercise.points} pontos
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-4">
                  <Link href={`/exercise/${exercise.id}`}>
                    <Button 
                      className="w-full rpg-button"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {isCompleted ? "Revisar" : "Começar"}
                    </Button>
                  </Link>
                </CardContent>
              </GlowCard>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="flex items-center bg-gray-700/50 text-white border-purple-500/20 hover:bg-purple-500/20 hover:text-white hover:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Anterior
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first page, last page, current page and pages around current page
                const showPage = page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                const showDots = (page === currentPage - 2 && currentPage > 3) || (page === currentPage + 2 && currentPage < totalPages - 2);
                
                if (!showPage && !showDots) return null;
                
                if (showDots) {
                  return <span key={page} className="px-2" style={{ color: '#fff6e9' }}>...</span>;
                }
                
                return (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={page === currentPage 
                      ? "number bg-purple-500 text-white hover:bg-purple-600 border-purple-500" 
                      : "bg-gray-700/50 text-white border-purple-500/20 hover:bg-purple-500/20 hover:text-white hover:border-purple-500"}
                  >
                    {page}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center bg-gray-700/50 text-white border-purple-500/20 hover:bg-purple-500/20 hover:text-white hover:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próximo
              <ChevronRightIcon className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {/* Empty State */}
        {filteredExercises.length === 0 && (
          <div className="text-center py-12">
            <Icon className="w-16 h-16 mx-auto mb-4" style={{ color: '#9d4edd' }} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#9d4edd' }}>
              Nenhum exercício {config.title} encontrado
            </h3>
          </div>
        )}
      </div>
    </div>
  );
}