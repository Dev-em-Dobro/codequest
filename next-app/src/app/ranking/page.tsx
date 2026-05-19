"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";

type Exercise = {
    id: string;
    points: number;
};

type RankingUser = {
    id: string;
    name: string;
    avatar?: string;
    totalPoints: number;
    completedExercises: number;
    rank: number;
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

    const rankedUsers = rankingQuery.data ?? [];
    const topUsers = rankedUsers.slice(0, 10);
    const totalAvailablePoints = (exercisesQuery.data ?? []).reduce((accumulator, exercise) => {
        return accumulator + Number(exercise.points || 0);
    }, 0);
    const currentUserEntry = rankedUsers.find((entry) => entry.id === user?.id);

    const isLoading = rankingQuery.isLoading || exercisesQuery.isLoading;
    const hasError = rankingQuery.isError || exercisesQuery.isError;

    if (isLoading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 text-zinc-900">
                <div className="rounded-xl border border-zinc-200 bg-white px-6 py-4 text-sm text-zinc-600 shadow-sm">
                    Carregando ranking...
                </div>
            </main>
        );
    }

    if (hasError) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 text-zinc-900">
                <div className="w-full max-w-xl rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
                    Nao foi possivel carregar o ranking agora.
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900">
            <div className="mx-auto w-full max-w-4xl space-y-6">
                <header className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <h1 className="text-2xl font-semibold tracking-tight">Ranking dos Aventureiros</h1>
                    <p className="mt-2 text-sm text-zinc-600">
                        Compare seu progresso com a comunidade. Pontos totais disponiveis: {totalAvailablePoints}
                    </p>
                </header>

                {currentUserEntry ? (
                    <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                        Sua posicao atual: <strong>#{currentUserEntry.rank}</strong> com {currentUserEntry.totalPoints} pontos.
                    </section>
                ) : null}

                <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
                    <div className="grid grid-cols-[64px_1fr_120px_140px] gap-3 border-b border-zinc-200 bg-zinc-100 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                        <span>#</span>
                        <span>Usuario</span>
                        <span className="text-right">Pontos</span>
                        <span className="text-right">Exercicios</span>
                    </div>

                    {topUsers.length === 0 ? (
                        <div className="px-4 py-6 text-sm text-zinc-600">Nenhum usuario no ranking ainda.</div>
                    ) : (
                        topUsers.map((entry) => (
                            <div
                                key={entry.id}
                                className="grid grid-cols-[64px_1fr_120px_140px] items-center gap-3 border-b border-zinc-100 px-4 py-3 text-sm last:border-b-0"
                            >
                                <span className="font-semibold text-zinc-700">#{entry.rank}</span>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-200 text-xs font-semibold text-zinc-700">
                                        {getUserInitials(entry.name)}
                                    </div>
                                    <span className="truncate font-medium text-zinc-800">{entry.name}</span>
                                </div>
                                <span className="text-right font-semibold text-zinc-800">{entry.totalPoints}</span>
                                <span className="text-right text-zinc-600">{entry.completedExercises}</span>
                            </div>
                        ))
                    )}
                </section>

                <div>
                    <Link href="/" className="text-sm font-medium text-zinc-700 hover:underline">
                        Voltar para inicio
                    </Link>
                </div>
            </div>
        </main>
    );
}
