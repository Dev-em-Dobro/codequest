"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    ChevronLeft,
    ChevronRight,
    Code,
    Gem,
    Palette,
    Play,
    Trophy,
    Zap,
    CheckCircle2,
} from "lucide-react";
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

const categoryConfig: Record<ExerciseCategory, {
    title: string;
    description: string;
    icon: typeof Code;
}> = {
    html: {
        title: "HTML",
        description: "Aprenda HTML através de exercícios práticos",
        icon: Code,
    },
    css: {
        title: "CSS",
        description: "Domine estilização e layouts com CSS",
        icon: Palette,
    },
    javascript: {
        title: "JavaScript",
        description: "Adicione interatividade com JavaScript",
        icon: Zap,
    },
};

function isValidCategory(value: string): value is ExerciseCategory {
    return value === "html" || value === "css" || value === "javascript";
}

function getDifficultyBadgeClass(difficulty: string): string {
    if (difficulty === "iniciante") {
        return "bg-green-100 text-green-800";
    }

    if (difficulty === "intermediario") {
        return "bg-yellow-100 text-yellow-800";
    }

    return "bg-red-100 text-red-800";
}

export default function ExercisesByCategoryPage() {
    const router = useRouter();
    const params = useParams<{ category: string }>();
    const categoryParam = (params.category ?? "").toLowerCase();
    const isCategoryValid = isValidCategory(categoryParam);
    const { isAuthenticated, isLoading: authLoading, user } = useAuth();

    const [currentPage, setCurrentPage] = useState(1);
    const [selectedDifficulty, setSelectedDifficulty] = useState("all");

    const queryParams = useMemo(() => {
        if (!isCategoryValid) {
            return "";
        }

        const query = new URLSearchParams({ category: categoryParam });
        if (selectedDifficulty !== "all") {
            query.set("difficulty", selectedDifficulty);
        }

        return query.toString();
    }, [categoryParam, isCategoryValid, selectedDifficulty]);

    const exercisesQuery = useQuery({
        queryKey: ["/api/exercises", categoryParam, selectedDifficulty],
        queryFn: () => apiClient<Exercise[]>(`/exercises?${queryParams}`),
        enabled: isCategoryValid,
        staleTime: 5 * 60 * 1000,
    });

    const allCategoryExercisesQuery = useQuery({
        queryKey: ["/api/exercises", categoryParam, "all-for-stats"],
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

    useEffect(() => {
        if (authLoading || isAuthenticated) {
            return;
        }

        const redirectPath = `/exercises/${categoryParam}`;
        router.replace(`/auth/signin?redirect=${encodeURIComponent(redirectPath)}`);
    }, [authLoading, isAuthenticated, categoryParam, router]);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedDifficulty]);

    useEffect(() => {
        if (!user) {
            return;
        }

        void progressQuery.refetch();
    }, [user, progressQuery]);

    if (authLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen bg-black">
                <Header />
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
                </div>
            </div>
        );
    }

    if (!isCategoryValid) {
        return (
            <div className="min-h-screen bg-black">
                <Header />
                <main className="max-w-4xl mx-auto px-4 py-10">
                    <div className="rounded-xl border border-red-500/40 bg-red-950/40 p-6 text-red-200">
                        Categoria inválida. Use /exercises/html, /exercises/css ou /exercises/javascript.
                    </div>
                </main>
            </div>
        );
    }

    const config = categoryConfig[categoryParam];
    const Icon = config.icon;

    if (exercisesQuery.isLoading || allCategoryExercisesQuery.isLoading) {
        return (
            <div className="min-h-screen bg-black">
                <Header />
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
                </div>
            </div>
        );
    }

    const filteredExercises = exercisesQuery.data ?? [];
    const allExercisesForStats = allCategoryExercisesQuery.data ?? [];
    const progress = progressQuery.data ?? [];

    const completedExercises = progress.filter((entry) => entry.completed);
    const totalCompleted = completedExercises.filter((entry) => allExercisesForStats.some((exercise) => exercise.id === entry.exerciseId)).length;

    const exercisesPerPage = 10;
    const totalPages = Math.max(1, Math.ceil(filteredExercises.length / exercisesPerPage));
    const startIndex = (currentPage - 1) * exercisesPerPage;
    const endIndex = startIndex + exercisesPerPage;
    const paginatedExercises = filteredExercises.slice(startIndex, endIndex);

    const progressPercent = allExercisesForStats.length > 0 ? Math.round((totalCompleted / allExercisesForStats.length) * 100) : 0;

    return (
        <div className="min-h-screen bg-black">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-3" style={{ color: "#9d4edd", fontFamily: "var(--font-retro)" }}>
                        Exercícios {config.title}
                    </h1>
                    <p style={{ color: "#fff6e9" }}>{config.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <GlowCard glowColor="purple" customSize className="h-full">
                        <div className="p-6">
                            <div className="flex items-center space-x-2">
                                <Trophy className="w-5 h-5" style={{ color: "#9d4edd" }} />
                                <div>
                                    <p className="text-sm" style={{ color: "#fff6e9" }}>Exercícios Completados</p>
                                    <p className="text-2xl font-bold number" style={{ color: "#9d4edd" }}>
                                        {`${totalCompleted}/${allExercisesForStats.length}`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </GlowCard>

                    <GlowCard glowColor="purple" customSize className="h-full">
                        <div className="p-6">
                            <div className="flex items-center space-x-2">
                                <Gem className="w-5 h-5" style={{ color: "#9d4edd" }} />
                                <div>
                                    <p className="text-sm" style={{ color: "#fff6e9" }}>Pontos Disponíveis</p>
                                    <p className="text-2xl font-bold number" style={{ color: "#9d4edd" }}>
                                        {allExercisesForStats.reduce((sum, exercise) => sum + Number(exercise.points || 0), 0)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </GlowCard>

                    <GlowCard glowColor="purple" customSize className="h-full">
                        <div className="p-6">
                            <div className="flex items-center space-x-2">
                                <Icon className="w-5 h-5" style={{ color: "#9d4edd" }} />
                                <div className="w-full">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-sm" style={{ color: "#fff6e9" }}>Progresso</p>
                                        <span className="text-sm font-medium ml-4" style={{ color: "#9d4edd" }}>
                                            {progressPercent}%
                                        </span>
                                    </div>

                                    <div className="mt-1 relative h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: "rgba(75, 85, 99, 0.3)" }}>
                                        <div
                                            className="h-full transition-all duration-300"
                                            style={{
                                                width: `${progressPercent}%`,
                                                backgroundColor: "#9d4edd",
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </GlowCard>
                </div>

                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-lg" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)", border: "1px solid rgba(157, 78, 221, 0.3)" }}>
                    <div>
                        <label htmlFor="difficulty" className="text-sm font-medium mb-2 block" style={{ color: "#fff6e9" }}>
                            Filtrar por dificuldade
                        </label>
                        <select
                            id="difficulty"
                            value={selectedDifficulty}
                            onChange={(event) => setSelectedDifficulty(event.target.value)}
                            className="w-56 rounded-md border border-gray-300 bg-white/95 px-3 py-2 text-sm text-gray-800 font-medium"
                        >
                            <option value="all">Todas as dificuldades</option>
                            <option value="iniciante">Iniciante</option>
                            <option value="intermediario">Intermediário</option>
                            <option value="avancado">Avançado</option>
                        </select>
                    </div>

                    <div className="text-sm px-3 py-2 rounded-md" style={{ color: "#fff6e9", backgroundColor: "rgba(157, 78, 221, 0.2)" }}>
                        Mostrando {filteredExercises.length === 0 ? 0 : startIndex + 1}-{Math.min(endIndex, filteredExercises.length)} de {filteredExercises.length} exercícios
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedExercises.map((exercise) => {
                        const isCompleted = completedExercises.some((entry) => entry.exerciseId === exercise.id);

                        return (
                            <GlowCard
                                key={exercise.id}
                                glowColor={isCompleted ? "green" : "purple"}
                                customSize
                                className={`h-full ${isCompleted ? "ring-2 ring-green-500 border-2 border-green-500" : ""}`}
                            >
                                <div className="p-6">
                                    <div className="pb-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="text-md font-bold number" style={{ color: "#9d4edd" }}>
                                                {exercise.title}
                                            </h3>
                                            {isCompleted ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : null}
                                        </div>

                                        <p className="mt-4 text-sm" style={{ color: "#fff6e9" }}>
                                            {exercise.description}
                                        </p>

                                        <div className="flex items-center justify-between mt-4 pt-4">
                                            <span className={`text-xs px-2 py-1 rounded ${getDifficultyBadgeClass(exercise.difficulty)}`}>
                                                {exercise.difficulty}
                                            </span>
                                            <div className="flex items-center text-sm number" style={{ color: "#fff6e9" }}>
                                                <Gem className="w-4 h-4 mr-1" style={{ color: "#9d4edd" }} />
                                                {exercise.points} pontos
                                            </div>
                                        </div>
                                    </div>

                                    <Link href={`/exercise/${exercise.id}`}>
                                        <button type="button" className="w-full rpg-button">
                                            <Play className="w-4 h-4 mr-2 inline" />
                                            {isCompleted ? "Revisar" : "Começar"}
                                        </button>
                                    </Link>
                                </div>
                            </GlowCard>
                        );
                    })}
                </div>

                {totalPages > 1 ? (
                    <div className="mt-8 flex items-center justify-center space-x-2">
                        <button
                            type="button"
                            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                            disabled={currentPage === 1}
                            className="flex items-center rounded-md border border-purple-500/20 bg-gray-700/50 px-3 py-2 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-500/20"
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Anterior
                        </button>

                        <div className="flex items-center space-x-1">
                            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => {
                                const showPage = page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                                const showDots = (page === currentPage - 2 && currentPage > 3) || (page === currentPage + 2 && currentPage < totalPages - 2);

                                if (!showPage && !showDots) {
                                    return null;
                                }

                                if (showDots) {
                                    return (
                                        <span key={`dots-${page}`} className="px-2" style={{ color: "#fff6e9" }}>
                                            ...
                                        </span>
                                    );
                                }

                                return (
                                    <button
                                        key={page}
                                        type="button"
                                        onClick={() => setCurrentPage(page)}
                                        className={`rounded-md px-3 py-2 text-sm font-bold number ${page === currentPage
                                            ? "bg-purple-500 text-white border border-purple-500"
                                            : "bg-gray-700/50 text-white border border-purple-500/20 hover:bg-purple-500/20"
                                            }`}
                                    >
                                        {page}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            type="button"
                            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                            disabled={currentPage === totalPages}
                            className="flex items-center rounded-md border border-purple-500/20 bg-gray-700/50 px-3 py-2 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-500/20"
                        >
                            Próximo
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                    </div>
                ) : null}

                {filteredExercises.length === 0 ? (
                    <div className="text-center py-12">
                        <Icon className="w-16 h-16 mx-auto mb-4" style={{ color: "#9d4edd" }} />
                        <h3 className="text-lg font-semibold mb-2" style={{ color: "#9d4edd" }}>
                            Nenhum exercício {config.title} encontrado
                        </h3>
                    </div>
                ) : null}
            </main>
        </div>
    );
}
