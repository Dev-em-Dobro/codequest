"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Code, Gem, Shield, Star, Sword, Trophy, Zap } from "lucide-react";
import { Header } from "@/components/layout/header";
import { GlowCard } from "@/components/ui/spotlight-card";
import { useAuth } from "@/hooks/use-auth";
import { apiClient } from "@/lib/api-client";

type ExerciseCategory = "html" | "css" | "javascript";

type Exercise = {
    id: string;
    category: ExerciseCategory;
    points: number;
};

type UserProgress = {
    exerciseId: string;
    completed: boolean;
    pointsEarned: number;
};

type GuildInfo = {
    id: ExerciseCategory;
    name: string;
    title: string;
    description: string;
    route: string;
    icon: typeof Sword;
    glowColor: "orange" | "blue" | "green";
};

const guildsBase: GuildInfo[] = [
    {
        id: "html",
        name: "Exercícios HTML",
        title: "🔥 Construtores de Estruturas",
        description: "Domine as artes fundamentais da construção web",
        route: "/exercises/html",
        icon: Sword,
        glowColor: "orange",
    },
    {
        id: "css",
        name: "Exercícios CSS",
        title: "🛡️ Artistas da Estilização",
        description: "Transforme estruturas em obras de arte visual",
        route: "/exercises/css",
        icon: Shield,
        glowColor: "blue",
    },
    {
        id: "javascript",
        name: "Exercícios JavaScript",
        title: "⚡ Magos da Interatividade",
        description: "Invoque poderes mágicos de interação e lógica",
        route: "/exercises/javascript",
        icon: Zap,
        glowColor: "green",
    },
];

export default function CategoriesPage() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();

    const exercisesQuery = useQuery({
        queryKey: ["/api/exercises"],
        queryFn: () => apiClient<Exercise[]>("/exercises"),
        enabled: isAuthenticated && !authLoading,
        staleTime: 5 * 60 * 1000,
        placeholderData: [],
    });

    const progressQuery = useQuery({
        queryKey: ["/api/progress"],
        queryFn: () => apiClient<UserProgress[]>("/progress"),
        enabled: isAuthenticated && !authLoading,
        staleTime: 2 * 60 * 1000,
        placeholderData: [],
    });

    const exercises = exercisesQuery.data ?? [];
    const progress = progressQuery.data ?? [];
    const completedExercises = progress.filter((entry) => entry.completed);

    const guilds = guildsBase.map((guild) => {
        const guildExercises = exercises.filter((exercise) => exercise.category === guild.id);
        const completed = completedExercises.filter((item) =>
            guildExercises.some((exercise) => exercise.id === item.exerciseId),
        ).length;
        const totalPoints = guildExercises.reduce((sum, exercise) => sum + Number(exercise.points || 0), 0);

        return {
            ...guild,
            total: guildExercises.length,
            completed,
            totalPoints,
            percentage: guildExercises.length > 0 ? Math.round((completed / guildExercises.length) * 100) : 0,
        };
    });

    const totalExercises = exercises.length;
    const totalCompleted = completedExercises.length;
    const totalPoints = exercises.reduce((sum, exercise) => sum + Number(exercise.points || 0), 0);

    if (exercisesQuery.isLoading && isAuthenticated) {
        return (
            <div className="min-h-screen bg-black">
                <Header />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-zinc-700 rounded w-64" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="h-64 bg-zinc-800 rounded-lg" />
                            <div className="h-64 bg-zinc-800 rounded-lg" />
                            <div className="h-64 bg-zinc-800 rounded-lg" />
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
                <div className="text-center mb-12">
                    <div className="mb-6 flex justify-center">
                        <span className="relative overflow-hidden inline-block bg-[#1a1a1a] border border-gray-700 text-[#0CF2A0] px-3 py-0.5 rounded-full text-[10px] sm:text-xs font-medium cursor-pointer hover:border-[#0CF2A0]/50 transition-colors">
                            ✨ Powered by DevQuest AI
                            <span
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
                                    animation: "shine 2s linear infinite",
                                    opacity: 0.5,
                                    pointerEvents: "none",
                                }}
                            />
                        </span>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-3xl lg:text-4xl text-white font-bold">Plataforma de Exercícios</h1>
                    </div>

                    <div className="relative mb-6">
                        <p className="relative z-10 text-lg max-w-[500px] mx-auto leading-relaxed text-slate-400">
                            Pratique programação com exercícios interativos e conquiste pontos para se tornar um dev lendário
                        </p>
                    </div>

                    <div className="flex justify-center items-center gap-4 mb-8">
                        <div className="h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent w-32" />
                        <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                <path
                                    fillRule="evenodd"
                                    d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <div className="h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent w-32" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <GlowCard glowColor="blue" customSize className="flex flex-col min-h-[150px]">
                        <div className="flex items-center space-x-4 h-full">
                            <div className="p-3 rounded-xl bg-blue-500/20">
                                <Trophy className="w-8 h-8 text-blue-300" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-300">Total de Exercícios</p>
                                <p className="text-3xl font-bold text-white number">{totalExercises}</p>
                            </div>
                        </div>
                    </GlowCard>

                    <GlowCard glowColor="green" customSize className="flex flex-col min-h-[150px]">
                        <div className="flex items-center space-x-4 h-full">
                            <div className="p-3 rounded-xl bg-green-500/20">
                                <Star className="w-8 h-8 text-green-300" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-300">Exercícios Completados</p>
                                <p className="text-3xl font-bold text-white number">{totalCompleted}</p>
                            </div>
                        </div>
                    </GlowCard>

                    <GlowCard glowColor="purple" customSize className="flex flex-col min-h-[150px]">
                        <div className="flex items-center space-x-4 h-full">
                            <div className="p-3 rounded-xl bg-purple-500/20">
                                <Code className="w-8 h-8 text-purple-300" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-300">Pontos Disponíveis</p>
                                <p className="text-3xl font-bold text-white number">{totalPoints}</p>
                            </div>
                        </div>
                    </GlowCard>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    {guilds.map((guild) => (
                        <GlowCard key={guild.id} glowColor={guild.glowColor} customSize className="flex flex-col min-h-[500px]">
                            <div className="flex flex-col h-full gap-8">
                                <div className="text-center pb-4 mb-4">
                                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl bg-gradient-to-br from-purple-500 to-purple-600">
                                        <guild.icon className="text-white w-10 h-10" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">{guild.name}</h3>
                                    <p className="text-sm text-slate-300">{guild.description}</p>
                                </div>

                                <div className="flex-1 space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm text-slate-300">
                                            <span>Progresso</span>
                                            <span>
                                                <span className="number">{guild.percentage}</span>% Completo
                                            </span>
                                        </div>
                                        <div className="w-full bg-black/30 rounded-full h-3 border border-white/20 overflow-hidden">
                                            <div
                                                className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500"
                                                style={{ width: `${guild.percentage}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-center">
                                        <div className="bg-black/20 rounded-lg p-3 border border-white/10">
                                            <div className="text-2xl font-bold text-white number">{guild.completed}</div>
                                            <div className="text-xs text-slate-300">Exercícios Completos</div>
                                        </div>
                                        <div className="bg-black/20 rounded-lg p-3 border border-white/10">
                                            <div className="text-2xl font-bold text-white number">{guild.total}</div>
                                            <div className="text-xs text-slate-300">Total de Exercícios</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-center space-x-2 bg-amber-500/20 rounded-lg p-3 border border-amber-400/30">
                                        <Gem className="w-5 h-5 text-amber-300" />
                                        <span className="text-sm font-bold text-amber-200">
                                            Até <span className="number">{guild.totalPoints}</span> XP para conquistar
                                        </span>
                                    </div>

                                    <Link href={guild.route} className="block">
                                        <button type="button" className="w-full rpg-button group">
                                            Exercícios
                                            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </GlowCard>
                    ))}
                </div>
            </main>
        </div>
    );
}
