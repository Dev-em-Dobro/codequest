"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Filter, Home, Star, Target, Trophy } from "lucide-react";
import { Header } from "@/components/layout/header";
import { GlowCard } from "@/components/ui/spotlight-card";
import { useAuth } from "@/hooks/use-auth";
import { apiClient } from "@/lib/api-client";

type ExerciseCategory = "html" | "css" | "javascript";

type Exercise = {
    id: string;
    title: string;
    description: string;
    difficulty: "iniciante" | "intermediario" | "avancado";
    category: ExerciseCategory;
    points: number;
};

type Progress = {
    exerciseId: string;
    completed: boolean;
};

const validCategories = new Set<ExerciseCategory>(["html", "css", "javascript"]);

function isValidCategory(value: string): value is ExerciseCategory {
    return validCategories.has(value as ExerciseCategory);
}

const categoryClass: Record<ExerciseCategory, string> = {
    html: "guild-html",
    css: "guild-css",
    javascript: "guild-js",
};

const categoryTitle: Record<ExerciseCategory, string> = {
    html: "Guilda HTML",
    css: "Guilda CSS",
    javascript: "Guilda JavaScript",
};

const categoryDescription: Record<ExerciseCategory, string> = {
    html: "Domine a estrutura e semantica da web",
    css: "Crie estilos incriveis e layouts responsivos",
    javascript: "Desenvolva interatividade e logica avancada",
};

const categoryIcon: Record<ExerciseCategory, string> = {
    html: "🔥",
    css: "💧",
    javascript: "⚡",
};

export default function ExercisesByCategoryPage() {
    const { isAuthenticated } = useAuth();
    const params = useParams<{ category: string }>();
    const categoryParam = params.category?.toLowerCase() ?? "";
    const isCategoryValid = isValidCategory(categoryParam);

    const [selectedDifficulty, setSelectedDifficulty] = useState<"all" | "iniciante" | "intermediario" | "avancado">("all");
    const [currentPage, setCurrentPage] = useState(1);

    const filteredExercisesQuery = useQuery({
        queryKey: ["/api/exercises", categoryParam, selectedDifficulty],
        queryFn: () => {
            const difficultyFilter = selectedDifficulty !== "all" ? `&difficulty=${selectedDifficulty}` : "";
            return apiClient<Exercise[]>(`/exercises?category=${categoryParam}${difficultyFilter}`);
        },
        enabled: isCategoryValid,
        staleTime: 2 * 60 * 1000,
    });

    const allCategoryExercisesQuery = useQuery({
        queryKey: ["/api/exercises", "all", categoryParam],
        queryFn: () => apiClient<Exercise[]>(`/exercises?category=${categoryParam}`),
        enabled: isCategoryValid,
        staleTime: 5 * 60 * 1000,
    });

    const progressQuery = useQuery({
        queryKey: ["/api/progress"],
        queryFn: () => apiClient<Progress[]>("/progress"),
        enabled: isAuthenticated,
        staleTime: 2 * 60 * 1000,
    });

    if (!isCategoryValid) {
        return (
            <div className="min-h-screen bg-black">
                <Header />
                <main className="max-w-4xl mx-auto px-4 py-8">
                    <div className="rounded-xl border border-red-500/40 bg-red-950/40 p-6 text-red-200">
                        Categoria invalida. Use /exercises/html, /exercises/css ou /exercises/javascript.
                    </div>
                </main>
            </div>
        );
    }

    const exercises = filteredExercisesQuery.data ?? [];
    const allExercisesForStats = allCategoryExercisesQuery.data ?? [];
    const progressData = progressQuery.data ?? [];

    const allIds = new Set(allExercisesForStats.map((exercise) => exercise.id));
    const completedExercises = progressData.filter((entry) => entry.completed && allIds.has(entry.exerciseId));

    const itemsPerPage = 6;
    const totalPages = Math.ceil(exercises.length / itemsPerPage);
    const paginatedExercises = exercises.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleDifficultyChange = (difficulty: "all" | "iniciante" | "intermediario" | "avancado") => {
        setSelectedDifficulty(difficulty);
        setCurrentPage(1);
    };

    return (
        <div className="min-h-screen bg-black">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center space-x-2 text-sm mb-6" style={{ color: "#fff6e9" }}>
                    <Link href="/" className="hover:text-purple-400 transition-colors flex items-center">
                        <Home className="w-4 h-4 mr-1" />
                        Inicio
                    </Link>
                    <span>/</span>
                    <Link href="/categories" className="hover:text-purple-400 transition-colors">
                        Categorias
                    </Link>
                    <span>/</span>
                    <span className="text-purple-400">{categoryTitle[categoryParam]}</span>
                </div>

                <div className="text-center mb-8">
                    <div className="text-6xl mb-4">{categoryIcon[categoryParam]}</div>
                    <h1 className="text-4xl font-bold mb-3" style={{ color: "#fff6e9" }}>
                        {categoryTitle[categoryParam]}
                    </h1>
                    <p className="text-lg" style={{ color: "#fff6e9", opacity: 0.8 }}>
                        {categoryDescription[categoryParam]}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <GlowCard glowColor="blue" customSize className="p-6 text-center">
                        <Trophy className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                        <p className="text-2xl font-bold number" style={{ color: "#9d4edd" }}>
                            {allExercisesForStats.length}
                        </p>
                        <p className="text-sm" style={{ color: "#fff6e9", opacity: 0.8 }}>
                            Total de Exercicios
                        </p>
                    </GlowCard>

                    <GlowCard glowColor="green" customSize className="p-6 text-center">
                        <Star className="w-8 h-8 mx-auto mb-2 text-green-400" />
                        <p className="text-2xl font-bold number" style={{ color: "#9d4edd" }}>
                            {completedExercises.length}
                        </p>
                        <p className="text-sm" style={{ color: "#fff6e9", opacity: 0.8 }}>
                            Completados
                        </p>
                    </GlowCard>

                    <GlowCard glowColor="purple" customSize className="p-6 text-center">
                        <Target className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                        <p className="text-2xl font-bold number" style={{ color: "#9d4edd" }}>
                            {allExercisesForStats.reduce((total, exercise) => total + Number(exercise.points || 0), 0)}
                        </p>
                        <p className="text-sm" style={{ color: "#fff6e9", opacity: 0.8 }}>
                            Pontos Totais
                        </p>
                    </GlowCard>
                </div>

                <GlowCard glowColor="purple" customSize className="p-6 mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="w-5 h-5 text-purple-400" />
                        <h3 className="text-lg font-bold text-white">Filtrar por dificuldade</h3>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {[
                            { value: "all", label: "Todas" },
                            { value: "iniciante", label: "Iniciante" },
                            { value: "intermediario", label: "Intermediario" },
                            { value: "avancado", label: "Avancado" },
                        ].map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => handleDifficultyChange(option.value as "all" | "iniciante" | "intermediario" | "avancado")}
                                className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${selectedDifficulty === option.value
                                    ? "bg-purple-500 text-white border border-purple-500"
                                    : "bg-zinc-800 text-zinc-200 border border-zinc-700 hover:border-purple-500"
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </GlowCard>

                {filteredExercisesQuery.isLoading || allCategoryExercisesQuery.isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className="animate-pulse h-56 bg-zinc-800 rounded-lg" />
                        ))}
                    </div>
                ) : exercises.length === 0 ? (
                    <GlowCard glowColor="blue" customSize className="p-8 text-center">
                        <p className="text-lg text-white">Nenhum exercicio encontrado com os filtros atuais.</p>
                    </GlowCard>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {paginatedExercises.map((exercise) => {
                                const completed = progressData.some((entry) => entry.exerciseId === exercise.id && entry.completed);
                                const difficultyStyle =
                                    exercise.difficulty === "iniciante"
                                        ? "bg-green-500/20 text-green-300 border-green-500/30"
                                        : exercise.difficulty === "intermediario"
                                            ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                                            : "bg-red-500/20 text-red-300 border-red-500/30";

                                return (
                                    <div key={exercise.id} className={`rounded-xl border p-6 ${categoryClass[exercise.category]}`}>
                                        <div className="flex items-start justify-between mb-4 gap-3">
                                            <h3 className="text-lg font-bold leading-snug" style={{ color: "#fff6e9" }}>
                                                {exercise.title}
                                            </h3>
                                            <span className="text-sm px-2 py-1 rounded-md bg-purple-500/20 border border-purple-500/30 text-purple-200 number">
                                                {exercise.points} XP
                                            </span>
                                        </div>

                                        <p className="text-sm mb-4 line-clamp-2" style={{ color: "#fff6e9", opacity: 0.85 }}>
                                            {exercise.description}
                                        </p>

                                        <div className="flex items-center gap-2 mb-4 text-xs">
                                            <span className={`px-2 py-1 rounded border ${difficultyStyle}`}>{exercise.difficulty}</span>
                                            {completed ? (
                                                <span className="px-2 py-1 rounded border bg-green-500/20 text-green-300 border-green-500/30">
                                                    Concluido
                                                </span>
                                            ) : null}
                                        </div>

                                        <Link href={`/exercise/${exercise.id}`} className="block">
                                            <button type="button" className="w-full rpg-button">
                                                {completed ? "Revisar Exercicio" : "Iniciar Exercicio"}
                                            </button>
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>

                        {totalPages > 1 ? (
                            <div className="flex items-center justify-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                    disabled={currentPage <= 1}
                                    className="px-3 py-2 rounded-md border border-zinc-700 bg-zinc-800 text-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>

                                {Array.from({ length: totalPages }).map((_, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => setCurrentPage(index + 1)}
                                        className={`px-3 py-2 rounded-md text-sm font-bold number ${currentPage === index + 1
                                            ? "bg-purple-500 text-white border border-purple-500"
                                            : "bg-zinc-800 text-zinc-200 border border-zinc-700"
                                            }`}
                                    >
                                        {index + 1}
                                    </button>
                                ))}

                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                                    disabled={currentPage >= totalPages}
                                    className="px-3 py-2 rounded-md border border-zinc-700 bg-zinc-800 text-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        ) : null}
                    </>
                )}
            </main>
        </div>
    );
}
