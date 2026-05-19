"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Code, Palette, Play, Zap } from "lucide-react";
import { Header } from "@/components/layout/header";
import { GlowCard } from "@/components/ui/spotlight-card";
import { useAuth } from "@/hooks/use-auth";
import { apiClient } from "@/lib/api-client";

type ExerciseCategory = "html" | "css" | "javascript";

type Exercise = {
  id: string;
  category: ExerciseCategory;
};

type ProgressEntry = {
  exerciseId: string;
  completed: boolean;
};

const categoryDefinitions = [
  {
    id: "html" as const,
    title: "HTML",
    description: "Estrutura e semantica web",
    icon: Code,
    color: "#e34c26",
    bgColor: "rgba(227, 76, 38, 0.1)",
    href: "/exercises/html",
  },
  {
    id: "css" as const,
    title: "CSS",
    description: "Estilizacao e design visual",
    icon: Palette,
    color: "#1572b6",
    bgColor: "rgba(21, 114, 182, 0.1)",
    href: "/exercises/css",
  },
  {
    id: "javascript" as const,
    title: "JavaScript",
    description: "Interatividade e logica",
    icon: Zap,
    color: "#f7df1e",
    bgColor: "rgba(247, 223, 30, 0.1)",
    href: "/exercises/javascript",
  },
];

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();

  const exercisesQuery = useQuery({
    queryKey: ["/api/exercises"],
    queryFn: () => apiClient<Exercise[]>("/exercises"),
    staleTime: 5 * 60 * 1000,
    refetchOnMount: true,
    retry: 3,
    retryDelay: 1000,
  });

  const progressQuery = useQuery({
    queryKey: ["/api/progress"],
    queryFn: () => apiClient<ProgressEntry[]>("/progress"),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 3,
    retryDelay: 1000,
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      void progressQuery.refetch();
    }
  }, [isAuthenticated, progressQuery, user]);

  const exercises = exercisesQuery.data ?? [];
  const progress = progressQuery.data ?? [];

  const getCategoryStats = (categoryId: ExerciseCategory) => {
    const categoryExercises = exercises.filter((exercise) => exercise.category === categoryId);
    const completedProgress = progress.filter(
      (entry) => entry.completed && categoryExercises.some((exercise) => exercise.id === entry.exerciseId),
    );

    return {
      total: categoryExercises.length,
      completed: completedProgress.length,
    };
  };

  const categories = categoryDefinitions.map((category) => ({
    ...category,
    ...getCategoryStats(category.id),
  }));

  const scrollToCategories = () => {
    document.getElementById("categorias")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 text-center">
          <div className="mb-8">
            <span className="relative inline-block cursor-pointer overflow-hidden rounded-full border border-gray-700 bg-[#1a1a1a] px-4 py-1 text-xs font-medium text-[#0CF2A0] transition-colors hover:border-[#0CF2A0]/50 sm:text-sm">
              ✨ Powered by DevQuest AI
              <span
                style={{
                  position: "absolute",
                  inset: "0px",
                  background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
                  animation: "shine 2s linear infinite",
                  opacity: 0.5,
                  pointerEvents: "none",
                }}
              />
            </span>
          </div>

          <div className="mb-4 flex flex-col items-center justify-center">
            <Image src="/avatars/logo.png" alt="CodeQuest Logo" width={480} height={160} className="h-40 w-auto" />
          </div>

          <div className="mx-auto max-w-3xl">
            <p
              style={{
                color: "white",
                fontFamily: "Inter,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif",
                fontSize: "1.7rem",
                lineHeight: "2.1rem",
                fontWeight: 300,
              }}
            >
              Domine programacao web com desafios praticos, feedback inteligente por IA e experiencia de aprendizado
              personalizada para o seu ritmo.
            </p>

            <div className="mt-8 flex justify-center">
              <button type="button" className="rpg-button" onClick={scrollToCategories}>
                <Play className="mr-2 h-5 w-5" />
                Comecar Aventura
              </button>
            </div>
          </div>
        </div>

        <div id="categorias" style={{ paddingTop: "4rem" }}>
          <h2 className="mb-6 text-center text-2xl font-bold" style={{ color: "#9d4edd" }}>
            Escolha uma categoria para comecar
          </h2>

          <div className="mx-auto max-w-2xl" style={{ marginBottom: "2rem" }}>
            <p
              style={{
                color: "white",
                fontFamily: "Inter,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif",
                fontSize: "1.1rem",
                lineHeight: "1.75rem",
                fontWeight: 300,
                textAlign: "center",
              }}
            >
              Bem-vindo(a) Aventureiro(a)! Desbloqueie conquistas, colete pontos de experiencia e evolua do Novato ao
              Dev Lendario atraves de desafios praticos de programacao.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {categories.map((category) => {
              const Icon = category.icon;

              return (
                <GlowCard key={category.id} glowColor="purple" customSize>
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-lg"
                        style={{ backgroundColor: category.bgColor }}
                      >
                        <Icon className="h-6 w-6" style={{ color: category.color }} />
                      </div>

                      <span
                        className="number rounded-full border px-2 py-1 text-xs font-medium"
                        style={{ color: "#9d4edd", borderColor: "#9d4edd" }}
                      >
                        {progressQuery.isLoading || exercisesQuery.isLoading ? (
                          <span className="animate-pulse">--/--</span>
                        ) : (
                          `${category.completed}/${category.total}`
                        )}
                      </span>
                    </div>

                    <h3 style={{ color: "#fff6e9" }} className="text-lg font-semibold">
                      {category.title}
                    </h3>
                    <p style={{ color: "#fff6e9", opacity: 0.8 }} className="mt-1 text-sm">
                      {category.description}
                    </p>
                  </div>

                  <div>
                    <div className="mb-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium" style={{ color: "#fff6e9" }}>
                          Progresso
                        </span>
                        <span className="number text-sm" style={{ color: "#9d4edd" }}>
                          {progressQuery.isLoading || exercisesQuery.isLoading ? (
                            <span className="animate-pulse">--%</span>
                          ) : (
                            `${category.total > 0 ? Math.round((category.completed / category.total) * 100) : 0}%`
                          )}
                        </span>
                      </div>

                      <div
                        className="relative h-2 w-full overflow-hidden rounded-full"
                        style={{ backgroundColor: "rgba(75, 85, 99, 0.3)" }}
                      >
                        <div
                          className={`h-full transition-all duration-300 ${progressQuery.isLoading || exercisesQuery.isLoading ? "animate-pulse" : ""
                            }`}
                          style={{
                            width:
                              progressQuery.isLoading || exercisesQuery.isLoading
                                ? "20%"
                                : `${category.total > 0 ? (category.completed / category.total) * 100 : 0}%`,
                            backgroundColor:
                              progressQuery.isLoading || exercisesQuery.isLoading
                                ? "rgba(157, 78, 221, 0.4)"
                                : "#9d4edd",
                          }}
                        />
                      </div>
                    </div>

                    <Link href={category.href} className="block">
                      <button type="button" className="rpg-button w-full">
                        Comecar
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </button>
                    </Link>
                  </div>
                </GlowCard>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
