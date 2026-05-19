"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Crown, Home, Medal, Shield, Star, Trophy } from "lucide-react";
import { Header } from "@/components/layout/header";
import { GlowCard } from "@/components/ui/spotlight-card";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";

type Exercise = {
    id: string;
    points: number;
};

type RankingUser = {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
    github?: string;
    linkedin?: string;
    totalPoints: number;
    completedExercises: number;
    rank?: number;
};

function getUserInitials(name: string): string {
    if (!name.trim()) {
        return "U";
    }

    return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

export default function RankingPage() {
    const { user } = useAuth();

    const rankingQuery = useQuery({
        queryKey: ["/api/users/ranking"],
        queryFn: () => apiClient<RankingUser[]>("/users/ranking"),
        staleTime: 60 * 1000,
    });

    const exercisesQuery = useQuery({
        queryKey: ["/api/exercises"],
        queryFn: () => apiClient<Exercise[]>("/exercises"),
        staleTime: 5 * 60 * 1000,
    });

    const rankedUsers = (rankingQuery.data ?? []).map((entry, index) => ({
        ...entry,
        rank: entry.rank ?? index + 1,
    }));

    const totalAvailablePoints = (exercisesQuery.data ?? []).reduce((total, exercise) => {
        return total + Number(exercise.points || 0);
    }, 0);

    const currentUserEntry = rankedUsers.find(
        (entry) => entry.id === user?.id || (user?.email && entry.email === user.email),
    );

    const podiumFirst = rankedUsers[0];
    const podiumSecond = rankedUsers[1];
    const podiumThird = rankedUsers[2];

    const getUserPercentage = (userPoints: number, totalPoints: number) => {
        if (totalPoints <= 0) {
            return 0;
        }

        return Math.round((userPoints / totalPoints) * 100);
    };

    const getUserRank = (xp: number) => {
        if (xp >= 90) {
            return { title: "Lenda Supreme", color: "#ff6b35", icon: Crown };
        }
        if (xp >= 70) {
            return { title: "Mestre Arcano", color: "#9d4edd", icon: Trophy };
        }
        if (xp >= 50) {
            return { title: "Guardiao Senior", color: "#4ecdc4", icon: Star };
        }
        if (xp >= 30) {
            return { title: "Aventureiro", color: "#45b7d1", icon: Shield };
        }
        return { title: "Iniciante", color: "#95a5a6", icon: Medal };
    };

    const getPositionStyling = (position: number) => {
        if (position === 1) {
            return {
                border: "2px solid #ffd700",
                glow: "0 0 20px rgba(255, 215, 0, 0.4)",
                bg: "linear-gradient(135deg, #ffd70020, #ffed4a10)",
                color: "#ffd700",
            };
        }

        if (position === 2) {
            return {
                border: "2px solid #c0c0c0",
                glow: "0 0 15px rgba(192, 192, 192, 0.3)",
                bg: "linear-gradient(135deg, #c0c0c020, #e5e5e510)",
                color: "#c0c0c0",
            };
        }

        if (position === 3) {
            return {
                border: "2px solid #cd7f32",
                glow: "0 0 15px rgba(205, 127, 50, 0.3)",
                bg: "linear-gradient(135deg, #cd7f3220, #daa52010)",
                color: "#cd7f32",
            };
        }

        return {
            border: "1px solid rgba(157, 78, 221, 0.3)",
            glow: "none",
            bg: "rgba(0, 0, 0, 0.2)",
            color: "#9d4edd",
        };
    };

    const isLoading = rankingQuery.isLoading || exercisesQuery.isLoading;
    const hasError = rankingQuery.isError || exercisesQuery.isError;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black">
                <Header />
                <main className="max-w-7xl mx-auto px-4 py-8">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-zinc-700 rounded w-56" />
                        <div className="h-40 bg-zinc-800 rounded-lg" />
                        <div className="h-64 bg-zinc-800 rounded-lg" />
                    </div>
                </main>
            </div>
        );
    }

    if (hasError) {
        return (
            <div className="min-h-screen bg-black">
                <Header />
                <main className="max-w-4xl mx-auto px-4 py-8">
                    <div className="rounded-xl border border-red-500/40 bg-red-950/40 p-6 text-red-200">
                        Nao foi possivel carregar o ranking agora.
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <div className="flex items-center space-x-2 text-sm mb-4" style={{ color: "#fff6e9" }}>
                        <Link href="/" className="hover:text-purple-400 transition-colors">
                            <Home className="w-4 h-4 inline mr-1" />
                            Inicio
                        </Link>
                        <span>/</span>
                        <span className="text-purple-400">Ranking</span>
                    </div>

                    <div className="text-center">
                        <h1 className="text-4xl font-bold mb-4" style={{ color: "#fff6e9" }}>
                            Hall da Gloria
                        </h1>
                        <p className="text-lg" style={{ color: "#fff6e9", opacity: 0.8 }}>
                            Os maiores guerreiros da plataforma
                        </p>
                    </div>
                </div>

                {currentUserEntry ? (
                    <GlowCard glowColor="purple" customSize className="p-6 mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                            <div className="text-center md:text-left">
                                <h3 className="text-lg font-bold mb-2" style={{ color: "#fff6e9" }}>
                                    Sua Posicao Atual
                                </h3>
                                <p className="text-sm" style={{ color: "#fff6e9", opacity: 0.8 }}>
                                    Continue evoluindo para subir no ranking
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-4 border-purple-500 mb-2 bg-black/30">
                                    <span className="text-2xl font-bold number text-purple-400">#{currentUserEntry.rank}</span>
                                </div>
                                <p className="text-sm" style={{ color: "#fff6e9", opacity: 0.8 }}>
                                    Posicao Global
                                </p>
                            </div>

                            <div className="text-center md:text-right">
                                <p className="text-3xl font-bold number" style={{ color: "#9d4edd" }}>
                                    {currentUserEntry.totalPoints}
                                </p>
                                <p className="text-sm" style={{ color: "#fff6e9", opacity: 0.8 }}>
                                    XP acumulado
                                </p>
                                <p className="text-sm mt-1" style={{ color: "#fff6e9", opacity: 0.8 }}>
                                    {currentUserEntry.completedExercises} exercicios concluidos
                                </p>
                            </div>
                        </div>
                    </GlowCard>
                ) : null}

                {(podiumFirst || podiumSecond || podiumThird) ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {podiumSecond ? (
                            <GlowCard glowColor="blue" customSize className="p-6 lg:mt-8 order-2 lg:order-1">
                                <div className="text-center">
                                    <div className="relative mb-4">
                                        <div
                                            className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-2xl font-bold number"
                                            style={{
                                                border: getPositionStyling(2).border,
                                                background: getPositionStyling(2).bg,
                                                boxShadow: getPositionStyling(2).glow,
                                                color: getPositionStyling(2).color,
                                            }}
                                        >
                                            2
                                        </div>
                                        <div className="absolute -top-2 -right-2 text-2xl">🥈</div>
                                    </div>
                                    <h3 className="text-xl font-bold mb-1" style={{ color: "#fff6e9" }}>
                                        {podiumSecond.name}
                                    </h3>
                                    <p className="text-2xl font-bold number mb-1" style={{ color: getPositionStyling(2).color }}>
                                        {podiumSecond.totalPoints}
                                    </p>
                                    <p className="text-sm" style={{ color: "#fff6e9", opacity: 0.8 }}>
                                        XP
                                    </p>
                                </div>
                            </GlowCard>
                        ) : (
                            <div className="order-2 lg:order-1" />
                        )}

                        {podiumFirst ? (
                            <GlowCard glowColor="orange" customSize className="p-8 order-1 lg:order-2">
                                <div className="text-center">
                                    <div className="relative mb-6">
                                        <div
                                            className="w-24 h-24 rounded-full mx-auto flex items-center justify-center text-3xl font-bold number"
                                            style={{
                                                border: getPositionStyling(1).border,
                                                background: getPositionStyling(1).bg,
                                                boxShadow: getPositionStyling(1).glow,
                                                color: getPositionStyling(1).color,
                                            }}
                                        >
                                            1
                                        </div>
                                        <div className="absolute -top-3 -right-3 text-3xl">👑</div>
                                    </div>
                                    <h2 className="text-2xl font-bold mb-2" style={{ color: "#fff6e9" }}>
                                        {podiumFirst.name}
                                    </h2>
                                    <p className="text-3xl font-bold number mb-1" style={{ color: getPositionStyling(1).color }}>
                                        {podiumFirst.totalPoints}
                                    </p>
                                    <p className="text-sm mb-2" style={{ color: "#fff6e9", opacity: 0.8 }}>
                                        XP
                                    </p>
                                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30">
                                        <Crown className="w-4 h-4 mr-1 text-yellow-400" />
                                        <span className="text-xs font-bold text-yellow-400">CAMPEAO</span>
                                    </div>
                                </div>
                            </GlowCard>
                        ) : (
                            <div className="order-1 lg:order-2" />
                        )}

                        {podiumThird ? (
                            <GlowCard glowColor="green" customSize className="p-6 lg:mt-8 order-3">
                                <div className="text-center">
                                    <div className="relative mb-4">
                                        <div
                                            className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-2xl font-bold number"
                                            style={{
                                                border: getPositionStyling(3).border,
                                                background: getPositionStyling(3).bg,
                                                boxShadow: getPositionStyling(3).glow,
                                                color: getPositionStyling(3).color,
                                            }}
                                        >
                                            3
                                        </div>
                                        <div className="absolute -top-2 -right-2 text-2xl">🥉</div>
                                    </div>
                                    <h3 className="text-xl font-bold mb-1" style={{ color: "#fff6e9" }}>
                                        {podiumThird.name}
                                    </h3>
                                    <p className="text-2xl font-bold number mb-1" style={{ color: getPositionStyling(3).color }}>
                                        {podiumThird.totalPoints}
                                    </p>
                                    <p className="text-sm" style={{ color: "#fff6e9", opacity: 0.8 }}>
                                        XP
                                    </p>
                                </div>
                            </GlowCard>
                        ) : (
                            <div className="order-3" />
                        )}
                    </div>
                ) : null}

                <GlowCard glowColor="purple" customSize className="p-6">
                    <h2 className="text-2xl font-bold mb-6 flex items-center" style={{ color: "#fff6e9" }}>
                        <Trophy className="w-6 h-6 mr-3 text-purple-400" />
                        Ranking Completo
                    </h2>

                    <div className="space-y-3">
                        {rankedUsers.length === 0 ? (
                            <div className="rounded-xl border border-white/10 bg-black/25 p-8 text-center text-slate-300">
                                Nenhum usuario no ranking ainda.
                            </div>
                        ) : (
                            rankedUsers.map((rankedUser) => {
                                const positionStyling = getPositionStyling(rankedUser.rank ?? 0);
                                const percentage = getUserPercentage(rankedUser.totalPoints, totalAvailablePoints);
                                const userRank = getUserRank(percentage);

                                return (
                                    <div
                                        key={rankedUser.id}
                                        className={`p-4 rounded-lg transition-all duration-300 hover:scale-[1.01] ${rankedUser.id === user?.id ? "ring-2 ring-purple-500" : ""
                                            }`}
                                        style={{
                                            border: positionStyling.border,
                                            background: positionStyling.bg,
                                            boxShadow: positionStyling.glow,
                                        }}
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-4 min-w-0">
                                                <div className="w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold number text-sm shrink-0" style={{ borderColor: positionStyling.color, color: positionStyling.color }}>
                                                    #{rankedUser.rank}
                                                </div>

                                                {rankedUser.avatar ? (
                                                    <Image
                                                        src={`/avatars/${rankedUser.avatar}`}
                                                        alt={rankedUser.name}
                                                        width={48}
                                                        height={48}
                                                        className="w-12 h-12 rounded-full border-2 border-purple-500 object-cover shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full border-2 border-purple-500 bg-purple-900/40 flex items-center justify-center text-sm text-white font-semibold shrink-0">
                                                        {getUserInitials(rankedUser.name)}
                                                    </div>
                                                )}

                                                <div className="min-w-0">
                                                    <h3 className="font-bold truncate" style={{ color: "#fff6e9" }}>
                                                        {rankedUser.name}
                                                        {rankedUser.id === user?.id ? " (Voce)" : ""}
                                                    </h3>
                                                    <div className="text-sm flex items-center gap-2" style={{ color: "#fff6e9", opacity: 0.8 }}>
                                                        <span className="truncate">{userRank.title}</span>
                                                        <span>•</span>
                                                        <span className="number">{percentage}%</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right shrink-0">
                                                <div className="text-lg font-bold number" style={{ color: positionStyling.color }}>
                                                    {rankedUser.totalPoints} XP
                                                </div>
                                                <div className="text-sm" style={{ color: "#fff6e9", opacity: 0.8 }}>
                                                    {rankedUser.completedExercises} exercicios
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </GlowCard>
            </main>
        </div>
    );
}
