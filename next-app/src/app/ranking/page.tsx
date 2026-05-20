"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
    Award,
    ChevronRight,
    Crown,
    Gem,
    Shield,
    Sparkles,
    Star,
    Sword,
    Target,
    Trophy,
    Users,
    Zap,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { GlowCard } from "@/components/ui/spotlight-card";
import { useAuth } from "@/hooks/use-auth";
import { apiClient } from "@/lib/api-client";

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

type RankVisual = {
    name: string;
    icon: typeof Crown;
    color: string;
    bgColor: string;
    borderColor: string;
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

function getAvatarSource(avatar: string | undefined): string | null {
    if (!avatar?.trim()) {
        return null;
    }

    if (avatar.startsWith("http://") || avatar.startsWith("https://") || avatar.startsWith("/")) {
        return avatar;
    }

    const normalizedPath = avatar.replace(/^\/+/, "");
    if (normalizedPath.startsWith("avatars/")) {
        return `/${normalizedPath}`;
    }

    return `/avatars/${normalizedPath}`;
}

function getUserPercentage(userPoints: number, totalPoints: number): number {
    if (totalPoints === 0) {
        return 0;
    }

    return Math.round((userPoints / totalPoints) * 100);
}

function getUserRank(points: number, totalPoints: number): RankVisual {
    const percentage = getUserPercentage(points, totalPoints);

    if (percentage >= 81) {
        return {
            name: "Mitológico",
            icon: Crown,
            color: "#E8B4BC",
            bgColor: "rgba(232, 180, 188, 0.15)",
            borderColor: "rgba(232, 180, 188, 0.3)",
        };
    }

    if (percentage >= 65) {
        return {
            name: "Lendário",
            icon: Star,
            color: "#FFD700",
            bgColor: "rgba(255, 215, 0, 0.15)",
            borderColor: "rgba(255, 215, 0, 0.3)",
        };
    }

    if (percentage >= 49) {
        return {
            name: "Elite",
            icon: Gem,
            color: "#FF8C00",
            bgColor: "rgba(255, 140, 0, 0.15)",
            borderColor: "rgba(255, 140, 0, 0.3)",
        };
    }

    if (percentage >= 33) {
        return {
            name: "Veterano",
            icon: Shield,
            color: "#5E5CFF",
            bgColor: "rgba(94, 92, 255, 0.15)",
            borderColor: "rgba(94, 92, 255, 0.3)",
        };
    }

    if (percentage >= 17) {
        return {
            name: "Aventureiro",
            icon: Sword,
            color: "#50C878",
            bgColor: "rgba(80, 200, 120, 0.15)",
            borderColor: "rgba(80, 200, 120, 0.3)",
        };
    }

    return {
        name: "Novato",
        icon: Sparkles,
        color: "#C0C0C0",
        bgColor: "rgba(192, 192, 192, 0.15)",
        borderColor: "rgba(192, 192, 192, 0.3)",
    };
}

function getPositionStyling(position: number) {
    if (position === 1) {
        return {
            icon: Award,
            color: "#FFD700",
            bgGradient: "linear-gradient(135deg, #FFD700, #FFA500)",
            shadowColor: "rgba(255, 215, 0, 0.5)",
            title: "CAMPEÃO",
        };
    }

    if (position === 2) {
        return {
            icon: Award,
            color: "#C0C0C0",
            bgGradient: "linear-gradient(135deg, #C0C0C0, #A8A8A8)",
            shadowColor: "rgba(192, 192, 192, 0.5)",
            title: "2º Lugar",
        };
    }

    if (position === 3) {
        return {
            icon: Award,
            color: "#CD7F32",
            bgGradient: "linear-gradient(135deg, #CD7F32, #B8860B)",
            shadowColor: "rgba(205, 127, 50, 0.5)",
            title: "3º Lugar",
        };
    }

    return {
        icon: Target,
        color: "#9d4edd",
        bgGradient: "linear-gradient(135deg, #9d4edd, #7b2cbf)",
        shadowColor: "rgba(157, 78, 221, 0.5)",
        title: `#${position}`,
    };
}

export default function RankingPage() {
    const { isAuthenticated, user } = useAuth();

    const exercisesQuery = useQuery({
        queryKey: ["/api/exercises"],
        queryFn: () => apiClient<Exercise[]>("/exercises"),
        staleTime: 5 * 60 * 1000,
    });

    const rankingQuery = useQuery({
        queryKey: ["/api/users/ranking"],
        queryFn: () => apiClient<RankingUser[]>("/users/ranking"),
        staleTime: 15 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const rankedUsers = (rankingQuery.data ?? []).map((entry, index) => ({
        ...entry,
        rank: entry.rank ?? index + 1,
    }));

    const totalAvailablePoints = (exercisesQuery.data ?? []).reduce((sum, exercise) => {
        return sum + Number(exercise.points || 0);
    }, 0);

    const currentUserRank = rankedUsers.find((entry) => entry.id === user?.id || (user?.email && entry.email === user.email));

    const podiumCards = rankedUsers.length >= 3
        ? [
            {
                user: rankedUsers[1],
                position: 2,
                orderClass: "md:order-1 md:mt-8",
                glowColor: "blue" as const,
            },
            {
                user: rankedUsers[0],
                position: 1,
                orderClass: "md:order-2",
                glowColor: "orange" as const,
            },
            {
                user: rankedUsers[2],
                position: 3,
                orderClass: "md:order-3 md:mt-8",
                glowColor: "red" as const,
            },
        ]
        : [];

    if (rankingQuery.isLoading || exercisesQuery.isLoading) {
        return (
            <div className="min-h-screen bg-black">
                <Header />
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4" />
                        <p className="text-slate-300">Carregando ranking...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (rankingQuery.isError || exercisesQuery.isError) {
        return (
            <div className="min-h-screen bg-black">
                <Header />
                <main className="max-w-4xl mx-auto px-4 py-8">
                    <div className="rounded-xl border border-red-500/40 bg-red-950/40 p-6 text-red-200">
                        Não foi possível carregar o ranking agora.
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black">
            <Header />

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

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4" style={{ color: "#9d4edd", fontFamily: "var(--font-retro)" }}>
                        Hall da Fama
                    </h1>
                    <p className="text-xl" style={{ color: "#fff6e9" }}>
                        Os maiores aventureiros do DevQuest
                    </p>
                </div>

                {isAuthenticated && currentUserRank ? (
                    <div className="mb-8">
                        <GlowCard glowColor="purple" customSize>
                            <div className="p-6">
                                <div className="flex items-center gap-2 mb-4" style={{ color: "#9d4edd" }}>
                                    <Users className="w-5 h-5" />
                                    <h2 className="text-lg font-bold">Sua Posição</h2>
                                </div>

                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="w-16 h-16 rounded-full border-2 overflow-hidden bg-black/40 flex items-center justify-center" style={{ borderColor: getUserRank(currentUserRank.totalPoints, totalAvailablePoints).color }}>
                                                {getAvatarSource(currentUserRank.avatar) ? (
                                                    <Image
                                                        src={getAvatarSource(currentUserRank.avatar) ?? "/avatars/rpg-male-1.JPG"}
                                                        alt={currentUserRank.name}
                                                        width={64}
                                                        height={64}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-lg font-bold text-white">{getUserInitials(currentUserRank.name)}</span>
                                                )}
                                            </div>
                                            <div
                                                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                                                style={{
                                                    backgroundColor: getPositionStyling(currentUserRank.rank ?? 0).color,
                                                    color: "#0a0a0a",
                                                    boxShadow: `0 0 10px ${getPositionStyling(currentUserRank.rank ?? 0).shadowColor}`,
                                                }}
                                            >
                                                #{currentUserRank.rank}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-xl font-bold" style={{ color: "#fff6e9" }}>
                                                {currentUserRank.name}
                                            </h3>

                                            <div className="flex flex-wrap items-center gap-2 mt-1 text-sm">
                                                <span
                                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md border"
                                                    style={{
                                                        backgroundColor: getUserRank(currentUserRank.totalPoints, totalAvailablePoints).bgColor,
                                                        borderColor: getUserRank(currentUserRank.totalPoints, totalAvailablePoints).borderColor,
                                                        color: getUserRank(currentUserRank.totalPoints, totalAvailablePoints).color,
                                                    }}
                                                >
                                                    {(() => {
                                                        const CurrentRankIcon = getUserRank(currentUserRank.totalPoints, totalAvailablePoints).icon;
                                                        return <CurrentRankIcon className="w-3 h-3" />;
                                                    })()}
                                                    {getUserRank(currentUserRank.totalPoints, totalAvailablePoints).name}
                                                </span>

                                                <span className="flex items-center gap-1" style={{ color: "#fff6e9" }}>
                                                    <Gem className="w-4 h-4" style={{ color: "#9d4edd" }} />
                                                    <span className="number">{currentUserRank.totalPoints}</span> XP
                                                </span>

                                                <span className="flex items-center gap-1" style={{ color: "#fff6e9" }}>
                                                    <Zap className="w-4 h-4" style={{ color: "#50C878" }} />
                                                    <span className="number">{currentUserRank.completedExercises}</span> exercícios
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-2xl font-bold number" style={{ color: getPositionStyling(currentUserRank.rank ?? 0).color }}>
                                            #{currentUserRank.rank}
                                        </p>
                                        <p className="text-sm" style={{ color: "#fff6e9", opacity: 0.85 }}>
                                            Posição
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </GlowCard>
                    </div>
                ) : null}

                {podiumCards.length > 0 ? (
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-center mb-8" style={{ color: "#9d4edd" }}>
                            🏆 Pódio dos Campeões
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            {podiumCards.map((podiumCard) => {
                                const podiumUser = podiumCard.user;
                                const position = podiumCard.position;
                                const style = getPositionStyling(position);
                                const rankData = getUserRank(podiumUser.totalPoints, totalAvailablePoints);
                                const RankIcon = rankData.icon;

                                return (
                                    <div key={podiumUser.id} className={podiumCard.orderClass}>
                                        <GlowCard glowColor={podiumCard.glowColor} customSize>
                                            <div className="relative p-6 text-center">
                                                <div
                                                    className="absolute left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-white font-bold text-sm"
                                                    style={{
                                                        top: position === 1 ? "-24px" : "-16px",
                                                        background: style.bgGradient,
                                                        boxShadow: `0 4px 15px ${style.shadowColor}`,
                                                    }}
                                                >
                                                    {style.title}
                                                </div>

                                                <div className="relative mb-4 mt-3">
                                                    <div className="w-24 h-24 mx-auto rounded-full border-4 overflow-hidden bg-black/40 flex items-center justify-center" style={{ borderColor: style.color }}>
                                                        {getAvatarSource(podiumUser.avatar) ? (
                                                            <Image
                                                                src={getAvatarSource(podiumUser.avatar) ?? "/avatars/rpg-male-1.JPG"}
                                                                alt={podiumUser.name}
                                                                width={96}
                                                                height={96}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-2xl font-bold text-white">{getUserInitials(podiumUser.name)}</span>
                                                        )}
                                                    </div>
                                                    <Award className="absolute -bottom-2 -right-2 w-8 h-8" style={{ color: style.color }} />
                                                </div>

                                                <h3 className="text-xl font-bold mb-2" style={{ color: "#fff6e9" }}>
                                                    {podiumUser.name}
                                                </h3>

                                                <span
                                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md border mb-3 text-sm"
                                                    style={{
                                                        backgroundColor: rankData.bgColor,
                                                        borderColor: rankData.borderColor,
                                                        color: rankData.color,
                                                    }}
                                                >
                                                    <RankIcon className="w-3 h-3" />
                                                    {rankData.name}
                                                </span>

                                                <p className="text-3xl font-bold number mb-1" style={{ color: style.color }}>
                                                    {podiumUser.totalPoints} XP
                                                </p>
                                                <p className="text-sm" style={{ color: "#fff6e9", opacity: 0.85 }}>
                                                    {podiumUser.completedExercises} exercícios completos
                                                </p>
                                            </div>
                                        </GlowCard>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : null}

                <div>
                    <h2 className="text-2xl font-bold text-center mb-8" style={{ color: "#9d4edd" }}>
                        Ranking Completo
                    </h2>

                    <div className="space-y-4">
                        {rankedUsers.length === 0 ? (
                            <div className="text-center py-12">
                                <Trophy className="w-16 h-16 mx-auto mb-4" style={{ color: "#9d4edd" }} />
                                <h3 className="text-lg font-semibold mb-2" style={{ color: "#9d4edd" }}>
                                    Nenhum aventureiro encontrado
                                </h3>
                                <p style={{ color: "#fff6e9", opacity: 0.8 }}>
                                    Seja o primeiro a completar exercícios e aparecer no ranking.
                                </p>
                            </div>
                        ) : (
                            rankedUsers.map((rankedUser, index) => {
                                const position = index + 1;
                                const positionStyle = getPositionStyling(position);
                                const rankData = getUserRank(rankedUser.totalPoints, totalAvailablePoints);
                                const RankIcon = rankData.icon;
                                const isCurrentUser = rankedUser.id === user?.id;

                                return (
                                    <GlowCard key={rankedUser.id} glowColor={isCurrentUser ? "purple" : "blue"} customSize className={`transition-all duration-200 ${isCurrentUser ? "ring-2 ring-purple-500 scale-[1.01]" : "hover:scale-[1.005]"}`}>
                                        <div className="p-6">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-4 min-w-0">
                                                    <div
                                                        className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shrink-0"
                                                        style={{
                                                            background: positionStyle.bgGradient,
                                                            boxShadow: `0 4px 15px ${positionStyle.shadowColor}`,
                                                        }}
                                                    >
                                                        {position <= 3 ? <positionStyle.icon className="w-6 h-6" /> : position}
                                                    </div>

                                                    <div className="w-14 h-14 rounded-full border-2 overflow-hidden bg-black/40 shrink-0" style={{ borderColor: rankData.color }}>
                                                        {getAvatarSource(rankedUser.avatar) ? (
                                                            <Image
                                                                src={getAvatarSource(rankedUser.avatar) ?? "/avatars/rpg-male-1.JPG"}
                                                                alt={rankedUser.name}
                                                                width={56}
                                                                height={56}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white">
                                                                {getUserInitials(rankedUser.name)}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <h3 className="text-lg font-bold truncate" style={{ color: "#fff6e9" }}>
                                                            {rankedUser.name}
                                                            {isCurrentUser ? <span className="ml-2 text-sm text-purple-400">(Você)</span> : null}
                                                        </h3>

                                                        <div className="flex flex-wrap items-center gap-2 mt-1 text-sm">
                                                            <span
                                                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border"
                                                                style={{
                                                                    backgroundColor: rankData.bgColor,
                                                                    borderColor: rankData.borderColor,
                                                                    color: rankData.color,
                                                                }}
                                                            >
                                                                <RankIcon className="w-3 h-3" />
                                                                {rankData.name}
                                                            </span>

                                                            <span className="flex items-center gap-1" style={{ color: "#fff6e9" }}>
                                                                <Gem className="w-4 h-4" style={{ color: "#9d4edd" }} />
                                                                <span className="number font-medium">{rankedUser.totalPoints}</span> XP
                                                            </span>

                                                            <span className="flex items-center gap-1" style={{ color: "#fff6e9" }}>
                                                                <Zap className="w-4 h-4" style={{ color: "#50C878" }} />
                                                                <span className="number font-medium">{rankedUser.completedExercises}</span> exercícios
                                                            </span>
                                                        </div>

                                                        {(rankedUser.github || rankedUser.linkedin) ? (
                                                            <div className="flex items-center gap-2 mt-2">
                                                                {rankedUser.github ? (
                                                                    <a
                                                                        href={rankedUser.github.startsWith("http") ? rankedUser.github : `https://github.com/${rankedUser.github}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="p-1 rounded-full hover:bg-zinc-700 transition-colors"
                                                                        title="GitHub"
                                                                    >
                                                                        <span className="text-[10px] font-bold text-zinc-300 hover:text-white">GH</span>
                                                                    </a>
                                                                ) : null}

                                                                {rankedUser.linkedin ? (
                                                                    <a
                                                                        href={rankedUser.linkedin.startsWith("http") ? rankedUser.linkedin : `https://linkedin.com/in/${rankedUser.linkedin}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="p-1 rounded-full hover:bg-zinc-700 transition-colors"
                                                                        title="LinkedIn"
                                                                    >
                                                                        <span className="text-[10px] font-bold text-blue-300 hover:text-blue-200">in</span>
                                                                    </a>
                                                                ) : null}
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                </div>

                                                <div className="text-right shrink-0">
                                                    <p className="text-lg font-bold number mb-1" style={{ color: rankData.color }}>
                                                        {getUserPercentage(rankedUser.totalPoints, totalAvailablePoints)}%
                                                    </p>
                                                    <p className="text-xs" style={{ color: "#fff6e9", opacity: 0.7 }}>
                                                        progresso
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </GlowCard>
                                );
                            })
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
