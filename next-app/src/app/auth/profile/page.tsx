"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, ChevronRight, Crown, LogOut, Medal, Settings, Shield, Star, Trophy } from "lucide-react";
import { Header } from "@/components/layout/header";
import { GlowCard } from "@/components/ui/spotlight-card";
import { useAuth } from "@/hooks/use-auth";
import { apiClient } from "@/lib/api-client";
import type { AuthUser } from "@/lib/auth-client";

type UpdateUserResponse = {
    success: boolean;
    user: {
        id: string;
        name?: string;
        email?: string;
        points?: number;
        level?: number;
        description?: string;
        avatar?: string;
        github?: string;
        linkedin?: string;
    };
};

type Exercise = {
    points: number;
};

type RankingUser = {
    id: string;
    email?: string;
    totalPoints: number;
    completedExercises: number;
};

type AvatarOption = {
    id: string;
    name: string;
    path: string;
};

type ProfileContentProps = {
    user: AuthUser;
    onSignOut: () => Promise<void>;
    updateAuthUser: (user: AuthUser | null) => void;
};

const avatarOptions: AvatarOption[] = [
    { id: "m1", name: "Guerreiro Arcano", path: "/avatars/rpg-male-1.JPG" },
    { id: "m2", name: "Guardiao da Lua", path: "/avatars/rpg-male-2.JPG" },
    { id: "m3", name: "Cacador de Sombras", path: "/avatars/rpg-male-3.JPG" },
    { id: "f1", name: "Sacerdotisa", path: "/avatars/rpg-female-1.JPG" },
    { id: "f2", name: "Arcanista", path: "/avatars/rpg-female-2.JPG" },
    { id: "f3", name: "Rainha das Runas", path: "/avatars/rpg-female-3.JPG" },
];

function getUserPercentage(userPoints: number, totalPoints: number) {
    if (totalPoints === 0) {
        return 0;
    }

    return (userPoints / totalPoints) * 100;
}

function getLegacyUserLevel(userPoints: number, totalPoints: number) {
    const percentage = getUserPercentage(userPoints, totalPoints);

    if (percentage >= 81) {
        return 6;
    }

    if (percentage >= 65) {
        return 5;
    }

    if (percentage >= 49) {
        return 4;
    }

    if (percentage >= 33) {
        return 3;
    }

    if (percentage >= 17) {
        return 2;
    }

    return 1;
}

function getLegacyProgressToNextLevel(userPoints: number, totalPoints: number) {
    const percentage = getUserPercentage(userPoints, totalPoints);

    let currentThreshold = 0;
    let nextThreshold = 17;

    if (percentage >= 81) {
        currentThreshold = 81;
        nextThreshold = 100;
    } else if (percentage >= 65) {
        currentThreshold = 65;
        nextThreshold = 81;
    } else if (percentage >= 49) {
        currentThreshold = 49;
        nextThreshold = 65;
    } else if (percentage >= 33) {
        currentThreshold = 33;
        nextThreshold = 49;
    } else if (percentage >= 17) {
        currentThreshold = 17;
        nextThreshold = 33;
    }

    const progressInLevel = percentage - currentThreshold;
    const levelRange = nextThreshold - currentThreshold;
    const progressPercentage = levelRange > 0 ? Math.round((progressInLevel / levelRange) * 100) : 100;
    const pointsForNextThreshold = Math.ceil((nextThreshold / 100) * totalPoints);

    return {
        percentage: Math.max(0, Math.min(100, progressPercentage)),
        nextThreshold: pointsForNextThreshold,
    };
}

function getUserRank(xpPercentage: number) {
    if (xpPercentage >= 81) {
        return { name: "Mitológico", color: "#E8B4BC", icon: Crown };
    }
    if (xpPercentage >= 65) {
        return { name: "Lendário", color: "#FFD700", icon: Star };
    }
    if (xpPercentage >= 49) {
        return { name: "Elite", color: "#FF8C00", icon: Trophy };
    }
    if (xpPercentage >= 33) {
        return { name: "Veterano", color: "#5E5CFF", icon: Shield };
    }
    if (xpPercentage >= 17) {
        return { name: "Aventureiro", color: "#50C878", icon: Medal };
    }

    return { name: "Novato", color: "#C0C0C0", icon: Medal };
}

function getUserInitials(name: string) {
    const trimmed = name.trim();
    if (!trimmed) {
        return "U";
    }

    return trimmed
        .split(" ")
        .map((item) => item[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

function getAvatarSource(avatar: string | undefined): string {
    if (!avatar?.trim()) {
        return "/avatars/rpg-male-1.JPG";
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

function ProfileContent({ user, onSignOut, updateAuthUser }: Readonly<ProfileContentProps>) {
    const [name, setName] = useState(user.name || "");
    const [description, setDescription] = useState(user.description || "");
    const [selectedAvatar, setSelectedAvatar] = useState(getAvatarSource(user.avatar));
    const [github, setGithub] = useState(user.github || "");
    const [linkedin, setLinkedin] = useState(user.linkedin || "");
    const [showAvatarSelector, setShowAvatarSelector] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateMessage, setUpdateMessage] = useState<string | null>(null);
    const [updateError, setUpdateError] = useState<string | null>(null);

    const exercisesQuery = useQuery({
        queryKey: ["/api/exercises"],
        queryFn: () => apiClient<Exercise[]>("/exercises"),
        staleTime: 5 * 60 * 1000,
    });

    const rankingQuery = useQuery({
        queryKey: ["/api/users/ranking"],
        queryFn: () => apiClient<RankingUser[]>("/users/ranking"),
        staleTime: 60 * 1000,
    });

    const ranking = rankingQuery.data ?? [];
    const rankingEntry = ranking.find((entry) => entry.id === user.id || (user.email && entry.email === user.email));

    const totalAvailablePoints = (exercisesQuery.data ?? []).reduce((sum, exercise) => {
        return sum + Number(exercise.points || 0);
    }, 0);

    const userPoints = rankingEntry?.totalPoints ?? user.points;
    const completedExercises = rankingEntry?.completedExercises ?? 0;
    const userLevel = getLegacyUserLevel(userPoints, totalAvailablePoints);
    const progressInfo = getLegacyProgressToNextLevel(userPoints, totalAvailablePoints);
    const rankPercentage = Math.round(getUserPercentage(userPoints, totalAvailablePoints));
    const userRank = getUserRank(rankPercentage);

    const handleSave = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!name.trim()) {
            setUpdateError("Informe seu nome antes de salvar.");
            return;
        }

        setIsUpdating(true);
        setUpdateMessage(null);
        setUpdateError(null);

        try {
            const avatarFile = selectedAvatar.split("/").pop() ?? "";

            const result = await apiClient<UpdateUserResponse>("/auth/update-user", {
                method: "POST",
                body: {
                    name: name.trim(),
                    description: description.trim(),
                    avatar: avatarFile,
                    github: github.trim(),
                    linkedin: linkedin.trim(),
                },
            });

            if (!result.user?.id) {
                throw new Error("Resposta de perfil invalida");
            }

            const nextUser: AuthUser = {
                id: result.user.id,
                name: result.user.name || name.trim(),
                email: result.user.email || user.email,
                points: Number(result.user.points ?? user.points),
                level: Number(
                    result.user.level ??
                    getLegacyUserLevel(Number(result.user.points ?? user.points), totalAvailablePoints),
                ),
                description: result.user.description || description,
                avatar: result.user.avatar || avatarFile,
                github: result.user.github || github,
                linkedin: result.user.linkedin || linkedin,
            };

            updateAuthUser(nextUser);
            setUpdateMessage("Perfil atualizado com sucesso.");
        } catch (saveError) {
            const message = saveError instanceof Error ? saveError.message : "Falha ao atualizar perfil";
            setUpdateError(message);
        } finally {
            setIsUpdating(false);
        }
    };

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
                            <span className="text-purple-400 font-medium">Perfil do Aventureiro</span>
                        </li>
                    </ol>
                </nav>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <GlowCard glowColor="purple" customSize className="h-fit">
                        <div className="p-6">
                            <h1 className="text-2xl font-bold text-white mb-6">Dados do Usuário</h1>

                            <form className="space-y-6" onSubmit={handleSave}>
                                <div className="space-y-2">
                                    <label className="text-white font-bold text-sm" htmlFor="profile-name">
                                        Nome
                                    </label>
                                    <input
                                        id="profile-name"
                                        type="text"
                                        value={name}
                                        onChange={(event) => setName(event.target.value)}
                                        disabled={isUpdating}
                                        required
                                        className="input-8bit w-full"
                                        placeholder="Digite seu nome..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <span className="text-white font-bold text-sm">Avatar</span>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 rounded-full border-2 border-purple-500/50 overflow-hidden bg-purple-900/20">
                                            {selectedAvatar ? (
                                                <Image src={selectedAvatar} alt="Avatar selecionado" width={48} height={48} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-white text-sm">
                                                    {getUserInitials(name || "U")}
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowAvatarSelector(true)}
                                            className="rpg-button px-4 py-2 text-sm"
                                        >
                                            Escolher Avatar
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-white font-bold text-sm" htmlFor="profile-description">
                                        Sobre
                                    </label>
                                    <textarea
                                        id="profile-description"
                                        value={description}
                                        onChange={(event) => setDescription(event.target.value)}
                                        disabled={isUpdating}
                                        className="input-8bit w-full resize-none"
                                        rows={4}
                                        placeholder="Descreva seu personagem..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-white font-bold text-sm" htmlFor="profile-github">
                                        GitHub
                                    </label>
                                    <input
                                        id="profile-github"
                                        type="text"
                                        value={github}
                                        onChange={(event) => setGithub(event.target.value)}
                                        className="input-8bit w-full"
                                        placeholder="usuario ou https://github.com/usuario"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-white font-bold text-sm" htmlFor="profile-linkedin">
                                        LinkedIn
                                    </label>
                                    <input
                                        id="profile-linkedin"
                                        type="url"
                                        value={linkedin}
                                        onChange={(event) => setLinkedin(event.target.value)}
                                        className="input-8bit w-full"
                                        placeholder="https://linkedin.com/in/seu-perfil"
                                    />
                                </div>

                                {updateError ? (
                                    <div className="p-3 rounded-md text-sm bg-red-900/30 border border-red-500/50 text-red-300">
                                        {updateError}
                                    </div>
                                ) : null}

                                {updateMessage ? (
                                    <div className="p-3 rounded-md text-sm bg-green-900/30 border border-green-500/50 text-green-300">
                                        {updateMessage}
                                    </div>
                                ) : null}

                                <div className="space-y-3">
                                    <button
                                        type="submit"
                                        onClick={() => setUpdateMessage(null)}
                                        disabled={isUpdating}
                                        className="rpg-button w-full flex items-center justify-center"
                                    >
                                        {isUpdating ? (
                                            <>
                                                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Salvando...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                                Salvar Perfil
                                            </>
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            void onSignOut();
                                        }}
                                        className="w-full border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-300 rounded-md px-4 py-2 text-sm font-semibold transition-colors flex items-center justify-center"
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Sair da Conta
                                    </button>
                                </div>
                            </form>
                        </div>
                    </GlowCard>

                    <div>
                        <GlowCard glowColor="green" customSize className="h-fit">
                            <div className="p-6">
                                <div className="bg-black/50 border-2 border-purple-500/40 rounded-lg p-6 text-center space-y-4">
                                    <div className="flex justify-center">
                                        <div className="relative group">
                                            <div className="w-24 h-24 rounded-full border-4 border-purple-500/50 overflow-hidden cursor-pointer transition-all hover:scale-105">
                                                {selectedAvatar ? (
                                                    <Image src={selectedAvatar} alt="Avatar do aventureiro" width={96} height={96} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-purple-900/20 flex items-center justify-center text-2xl text-white">
                                                        {getUserInitials(name || user.name)}
                                                    </div>
                                                )}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => setShowAvatarSelector(true)}
                                                className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Settings className="w-8 h-8 text-white" />
                                            </button>

                                            <div
                                                className="absolute -bottom-2 -right-2 rounded-full p-1"
                                                style={{ backgroundColor: userRank.color, boxShadow: `0 0 10px ${userRank.color}` }}
                                            >
                                                <userRank.icon className="w-6 h-6 text-black" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h2 className="text-xl font-bold text-white">{name || user.name || "Aventureiro"}</h2>
                                        <div
                                            className="inline-flex items-center space-x-1 px-3 py-1 rounded-full font-bold text-sm"
                                            style={{
                                                border: `2px solid ${userRank.color}`,
                                                boxShadow: `0 0 15px ${userRank.color}`,
                                                color: userRank.color,
                                                backgroundColor: "rgba(0, 0, 0, 0.25)",
                                            }}
                                        >
                                            <userRank.icon className="w-4 h-4" />
                                            <span>{userRank.name}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div className="space-y-1">
                                            <span className="text-2xl font-bold text-white number">{userLevel}</span>
                                            <p className="text-xs text-white">LVL</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-2xl font-bold text-yellow-400 number">{userPoints}</span>
                                            <p className="text-xs text-white">XP</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-2xl font-bold text-green-400 number">{completedExercises}</span>
                                            <p className="text-xs text-white">COMPLETADOS</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs text-white">
                                            <span>Progresso para próximo nível</span>
                                            <span>{progressInfo.percentage}%</span>
                                        </div>
                                        <div className="w-full rounded-full h-3 overflow-hidden bg-zinc-900 border border-purple-500/20">
                                            <div className="xp-bar h-full transition-all duration-1000" style={{ width: `${progressInfo.percentage}%` }} />
                                        </div>
                                        <div className="flex justify-between text-xs mt-1">
                                            <span style={{ color: userRank.color }}>{userPoints} XP</span>
                                            <span className="text-white opacity-60">Próximo: {progressInfo.nextThreshold} XP</span>
                                        </div>
                                    </div>

                                    {(description || user.description) ? (
                                        <div className="mt-4">
                                            <p className="text-sm text-white italic">&quot;{description || user.description}&quot;</p>
                                        </div>
                                    ) : null}

                                    {(github || linkedin) ? (
                                        <div className="mt-3 pt-3 border-t border-zinc-700">
                                            <div className="flex justify-center space-x-4 text-xs">
                                                {github ? (
                                                    <a
                                                        href={github.startsWith("http") ? github : `https://github.com/${github}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-zinc-300 hover:text-purple-400 transition-colors"
                                                    >
                                                        GitHub
                                                    </a>
                                                ) : null}

                                                {linkedin ? (
                                                    <a
                                                        href={linkedin}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-zinc-300 hover:text-blue-400 transition-colors"
                                                    >
                                                        LinkedIn
                                                    </a>
                                                ) : null}
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </GlowCard>
                    </div>
                </div>

                <div className="mt-12">
                    <GlowCard glowColor="orange" customSize className="w-full">
                        <div className="p-8">
                            <div className="flex items-center space-x-3 mb-8">
                                <Trophy className="w-8 h-8 text-orange-400" />
                                <h2 className="text-3xl font-bold text-white">Conquistas</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {userPoints >= 10 ? (
                                    <div className="relative group min-h-[140px]">
                                        <div
                                            className="relative flex flex-col justify-between h-full p-5 bg-black/90 rounded-lg border border-green-500/30 group-hover:border-green-400/50 transition-all duration-300"
                                            style={{ boxShadow: "0 0 8px rgba(34, 197, 94, 0.3)" }}
                                        >
                                            <div className="flex items-start space-x-4">
                                                <div className="flex-shrink-0">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                                                        <CheckCircle2 className="w-6 h-6 text-white" />
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-base text-white mb-1">Primeiro Passo</h4>
                                                    <p className="text-sm text-green-400">Ganhou seus primeiros <span className="font-bold">10 pontos</span></p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2 mt-3">
                                                <div className="w-full bg-gray-700 rounded-full h-2">
                                                    <div className="bg-gradient-to-r from-green-400 to-emerald-600 h-2 rounded-full w-full" />
                                                </div>
                                                <span className="text-xs text-green-400 font-bold whitespace-nowrap">100%</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : null}

                                {userPoints >= 50 ? (
                                    <div className="relative group min-h-[140px]">
                                        <div
                                            className="relative flex flex-col justify-between h-full p-5 bg-black/90 rounded-lg border border-blue-500/30 group-hover:border-blue-400/50 transition-all duration-300"
                                            style={{ boxShadow: "0 0 8px rgba(59, 130, 246, 0.3)" }}
                                        >
                                            <div className="flex items-start space-x-4">
                                                <div className="flex-shrink-0">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-full flex items-center justify-center shadow-lg">
                                                        <Star className="w-6 h-6 text-white" />
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-base text-white mb-1">Em Ascensao</h4>
                                                    <p className="text-sm text-blue-400">Alcancou <span className="font-bold">50 pontos</span> de experiencia</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2 mt-3">
                                                <div className="w-full bg-gray-700 rounded-full h-2">
                                                    <div className="bg-gradient-to-r from-blue-400 to-cyan-600 h-2 rounded-full w-full" />
                                                </div>
                                                <span className="text-xs text-blue-400 font-bold whitespace-nowrap">100%</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : null}

                                {userPoints >= 100 ? (
                                    <div className="relative group min-h-[140px]">
                                        <div
                                            className="relative flex flex-col justify-between h-full p-5 bg-black/90 rounded-lg border border-purple-500/30 group-hover:border-purple-400/50 transition-all duration-300"
                                            style={{ boxShadow: "0 0 8px rgba(147, 51, 234, 0.3)" }}
                                        >
                                            <div className="flex items-start space-x-4">
                                                <div className="flex-shrink-0">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                                                        <Crown className="w-6 h-6 text-white" />
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-base text-white mb-1">Centuriao</h4>
                                                    <p className="text-sm text-purple-400">Conquistou <span className="font-bold">100 pontos</span></p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2 mt-3">
                                                <div className="w-full bg-gray-700 rounded-full h-2">
                                                    <div className="bg-gradient-to-r from-purple-400 to-pink-600 h-2 rounded-full w-full" />
                                                </div>
                                                <span className="text-xs text-purple-400 font-bold whitespace-nowrap">100%</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : null}

                                {Array.from({ length: 20 }, (_, index) => (
                                    <div key={index} className="relative group opacity-40 min-h-[140px] cursor-not-allowed">
                                        <div className="relative flex flex-col justify-between h-full p-5 bg-black/50 rounded-lg border border-gray-600/30">
                                            <div className="flex items-start space-x-4">
                                                <div className="flex-shrink-0">
                                                    <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                                                        <span className="text-lg text-gray-400" style={{ fontFamily: "'Press Start 2P', monospace" }}>?</span>
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-base text-gray-400 mb-1">???</h4>
                                                    <p className="text-sm text-gray-500">Conquista surpresa bloqueada</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2 mt-3">
                                                <div className="w-full bg-gray-700 rounded-full h-2">
                                                    <div className="bg-gray-600 h-2 rounded-full w-0" />
                                                </div>
                                                <span className="text-xs text-gray-500 font-bold whitespace-nowrap">???</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </GlowCard>
                </div>
            </div>

            {showAvatarSelector ? (
                <div
                    className="fixed inset-0 z-9999 flex items-center justify-center"
                    style={{ backgroundColor: "rgba(0, 0, 0, 0.8)", backdropFilter: "blur(8px)" }}
                    role="button"
                    tabIndex={0}
                    aria-label="Fechar seletor de avatar"
                    onClick={(event) => {
                        if (event.target === event.currentTarget) {
                            setShowAvatarSelector(false);
                        }
                    }}
                    onKeyDown={(event) => {
                        if (event.key === "Escape" || event.key === "Enter" || event.key === " ") {
                            setShowAvatarSelector(false);
                        }
                    }}
                >
                    <div
                        className="w-full max-w-2xl mx-4 bg-black/95 rounded-lg border-2 p-6"
                        style={{ borderColor: "#9d4edd", boxShadow: "0 0 30px rgba(157, 78, 221, 0.5)" }}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Seletor de avatar"
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={(event) => {
                            if (event.key === "Escape") {
                                setShowAvatarSelector(false);
                            }
                        }}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white">Escolha seu Avatar</h3>
                            <button
                                type="button"
                                onClick={() => setShowAvatarSelector(false)}
                                className="text-white hover:bg-red-500/20 rounded-md px-2 py-1"
                            >
                                ×
                            </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                            {avatarOptions.map((avatar) => (
                                <button
                                    key={avatar.id}
                                    type="button"
                                    className={`relative text-left cursor-pointer group transition-all duration-200 rounded-lg overflow-hidden border-2 ${selectedAvatar === avatar.path
                                        ? "ring-2 ring-purple-500 scale-105 border-purple-500"
                                        : "border-zinc-600 hover:border-purple-400 hover:scale-105"
                                        }`}
                                    onClick={() => setSelectedAvatar(avatar.path)}
                                >
                                    <Image src={avatar.path} alt={avatar.name} width={256} height={256} className="w-full aspect-square object-cover" />
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2">
                                        <p className="text-xs text-white text-center font-bold">{avatar.name}</p>
                                    </div>
                                    {selectedAvatar === avatar.path ? (
                                        <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1 shadow-lg">
                                            <CheckCircle2 className="w-4 h-4 text-white" />
                                        </div>
                                    ) : null}
                                </button>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowAvatarSelector(false)}
                            className="w-full rpg-button"
                        >
                            Confirmar Seleção
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

export default function ProfilePage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading, signOut, setUser } = useAuth();

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.replace(`/auth/signin?redirect=${encodeURIComponent("/auth/profile")}`);
        }
    }, [authLoading, isAuthenticated, router]);

    if (authLoading) {
        return (
            <div className="min-h-screen bg-black">
                <Header />
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
                </div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return null;
    }

    const handleSignOut = async () => {
        await signOut();
        router.replace("/auth/signin");
    };

    return <ProfileContent key={user.id} user={user} onSignOut={handleSignOut} updateAuthUser={setUser} />;
}
