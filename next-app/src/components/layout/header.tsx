"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Crown,
    Gem,
    LogOut,
    Medal,
    MessageSquare,
    Shield,
    Sparkles,
    Star,
    Sword,
    User,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiClient } from "@/lib/api-client";

type Exercise = {
    points?: number;
};

type RankMeta = {
    name: string;
    icon: typeof Crown;
    color: string;
    bgColor: string;
    borderColor: string;
};

const avatarPlaceholders = [
    "/avatars/rpg-male-1.JPG",
    "/avatars/rpg-male-2.JPG",
    "/avatars/rpg-male-3.JPG",
    "/avatars/rpg-female-1.JPG",
    "/avatars/rpg-female-2.JPG",
    "/avatars/rpg-female-3.JPG",
];

function getAvatarSource(avatar: string | undefined, seed: string): string {
    if (avatar && avatar.trim().length > 0) {
        if (avatar.startsWith("http://") || avatar.startsWith("https://")) {
            return avatar;
        }

        const normalizedPath = avatar.replace(/^\/+/, "");
        if (normalizedPath.startsWith("avatars/")) {
            return `/${normalizedPath}`;
        }

        if (avatar.startsWith("/")) {
            return avatar;
        }

        return `/avatars/${normalizedPath}`;
    }

    const normalizedSeed = seed.trim();
    const hash = normalizedSeed
        .split("")
        .reduce((sum, char) => sum + (char.codePointAt(0) ?? 0), 0);

    return avatarPlaceholders[hash % avatarPlaceholders.length];
}

function resolveRank(userPoints: number, totalAvailablePoints: number): RankMeta {
    const percentage = totalAvailablePoints <= 0 ? 0 : (userPoints / totalAvailablePoints) * 100;

    if (percentage >= 81) {
        return {
            name: "Mitologico",
            icon: Crown,
            color: "#E8B4BC",
            bgColor: "rgba(232, 180, 188, 0.15)",
            borderColor: "rgba(232, 180, 188, 0.3)",
        };
    }

    if (percentage >= 65) {
        return {
            name: "Lendario",
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

export function Header() {
    const router = useRouter();
    const { user, signOut, isAuthenticated, isLoading } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const exercisesQuery = useQuery({
        queryKey: ["/api/exercises"],
        queryFn: () => apiClient<Exercise[]>("/exercises"),
        enabled: isAuthenticated && !isLoading,
        staleTime: 5 * 60 * 1000,
    });

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const totalAvailablePoints = useMemo(() => {
        const exercises = exercisesQuery.data ?? [];
        return exercises.reduce((total, exercise) => total + Number(exercise.points ?? 0), 0);
    }, [exercisesQuery.data]);

    const userPoints = Number(user?.points ?? 0);
    const userRank = resolveRank(userPoints, totalAvailablePoints);
    const RankIcon = userRank.icon;

    const handleSignOut = async () => {
        await signOut();
        router.push("/");
    };

    return (
        <header
            className="relative z-99 border-b border-slate-700/50 backdrop-blur-sm"
            style={{ backgroundColor: "rgba(17, 17, 17, 0.8)" }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-20 items-center justify-between">
                    <Link href="/" className="flex items-center justify-center hover:opacity-80 transition-opacity">
                        <Image src="/avatars/logo.png" alt="CodeQuest" width={168} height={56} className="h-14 w-auto" />
                    </Link>

                    <div className="relative flex items-center gap-4" ref={menuRef}>
                        {isAuthenticated && user ? (
                            <>
                                <div className="hidden items-center gap-3 sm:flex">
                                    <div
                                        className="flex items-center gap-2 rounded-full border px-3 py-1"
                                        style={{
                                            borderColor: "rgba(157, 78, 221, 0.4)",
                                            background: "linear-gradient(135deg, rgba(157, 78, 221, 0.22), rgba(31, 23, 78, 0.8))",
                                        }}
                                    >
                                        <Gem className="h-4 w-4" style={{ color: "#9d4edd" }} />
                                        <span className="text-sm font-medium" style={{ color: "#9d4edd" }}>
                                            <span className="number">{userPoints}</span> XP
                                        </span>
                                    </div>

                                    <div
                                        className="flex items-center gap-1 rounded-full border-2 px-3 py-1"
                                        style={{
                                            backgroundColor: userRank.bgColor,
                                            borderColor: userRank.borderColor,
                                            boxShadow: `0 0 10px ${userRank.borderColor}`,
                                        }}
                                    >
                                        <RankIcon className="h-4 w-4" style={{ color: userRank.color }} />
                                        <span className="text-xs font-bold" style={{ color: userRank.color }}>
                                            {userRank.name}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="relative h-10 w-10 overflow-hidden rounded-full border border-purple-400/40 bg-black/30 hover:scale-110 transition-all"
                                    onClick={() => setShowUserMenu((current) => !current)}
                                    aria-label="Abrir menu do usuario"
                                >
                                    <Image
                                        src={getAvatarSource(user.avatar, user.name)}
                                        alt={user.name}
                                        width={40}
                                        height={40}
                                        className="h-full w-full object-cover"
                                    />
                                </button>

                                {showUserMenu ? (
                                    <div
                                        className="absolute right-0 top-12 z-999 w-80 max-w-[calc(100vw-2rem)] rounded-lg shadow-2xl"
                                        style={{ backgroundColor: "rgb(45, 45, 45)" }}
                                    >
                                        <div className="border-b border-purple-300/20 p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-purple-300/40">
                                                    <Image
                                                        src={getAvatarSource(user.avatar, user.name)}
                                                        alt={user.name}
                                                        width={48}
                                                        height={48}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <h3 className="truncate text-lg font-semibold" style={{ color: "#fff6e9" }}>
                                                        {user.name}
                                                    </h3>
                                                    <p className="truncate text-sm opacity-80" style={{ color: "#fff6e9" }}>
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-3">
                                            <button
                                                type="button"
                                                className="w-full cursor-pointer rounded-lg p-3 text-left transition-all duration-200 hover:bg-gray-600"
                                                onClick={() => router.push("/auth/profile")}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-700">
                                                        <User className="h-4 w-4 text-white" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-white">Perfil do Aventureiro</div>
                                                        <div className="text-xs text-white/70">Ver suas conquistas e progresso</div>
                                                    </div>
                                                </div>
                                            </button>

                                            <button
                                                type="button"
                                                className="w-full cursor-pointer rounded-lg p-3 text-left transition-all duration-200 hover:bg-gray-600"
                                                onClick={() => router.push("/ranking")}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-700">
                                                        <Medal className="h-4 w-4 text-white" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-white">Ranking</div>
                                                        <div className="text-xs text-white/70">Ranking de alunos</div>
                                                    </div>
                                                </div>
                                            </button>

                                            <button
                                                type="button"
                                                className="w-full cursor-pointer rounded-lg p-3 text-left transition-all duration-200 hover:bg-gray-600"
                                                onClick={() => router.push("/feedback")}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-700">
                                                        <MessageSquare className="h-4 w-4 text-white" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-white">Enviar Feedback</div>
                                                        <div className="text-xs text-white/70">Ajude-nos a melhorar a plataforma</div>
                                                    </div>
                                                </div>
                                            </button>
                                        </div>

                                        <div className="mx-2 h-px bg-purple-200/20" />

                                        <div className="p-3">
                                            <button
                                                type="button"
                                                className="w-full cursor-pointer rounded-lg p-3 text-left transition-all duration-200 hover:bg-gray-600"
                                                onClick={() => {
                                                    void handleSignOut();
                                                }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-700">
                                                        <LogOut className="h-4 w-4 text-white" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-white">Sair da Conta</div>
                                                        <div className="text-xs text-white/70">Desconectar-se do CodeQuest</div>
                                                    </div>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                ) : null}
                            </>
                        ) : (
                            <Link href="/auth/signin" className="rpg-button px-4 py-2 text-sm">
                                Entrar
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
