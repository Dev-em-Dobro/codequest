"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

type Exercise = {
    id: string;
    title: string;
    description: string;
    difficulty: "iniciante" | "intermediario" | "avancado";
    category: "html" | "css" | "javascript";
    points: number;
};

export default function SimpleExercisePage() {
    const exercisesQuery = useQuery({
        queryKey: ["/api/exercises", "all"],
        queryFn: () => apiClient<Exercise[]>("/exercises"),
        staleTime: 5 * 60 * 1000,
    });

    if (exercisesQuery.isLoading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 text-zinc-900">
                <div className="rounded-xl border border-zinc-200 bg-white px-6 py-4 text-sm text-zinc-600 shadow-sm">
                    Carregando exercicios...
                </div>
            </main>
        );
    }

    if (exercisesQuery.isError) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 text-zinc-900">
                <div className="w-full max-w-xl rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
                    Nao foi possivel carregar os exercicios agora.
                </div>
            </main>
        );
    }

    const exercises = exercisesQuery.data ?? [];

    return (
        <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900">
            <div className="mx-auto w-full max-w-5xl space-y-6">
                <header className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <h1 className="text-2xl font-semibold tracking-tight">Exercicios</h1>
                    <p className="mt-2 text-sm text-zinc-600">Todos os exercicios disponiveis na trilha.</p>
                </header>

                <section className="grid gap-4 md:grid-cols-2">
                    {exercises.map((exercise) => (
                        <article key={exercise.id} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="text-lg font-semibold tracking-tight">{exercise.title}</h2>
                                <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
                                    {exercise.points} pts
                                </span>
                            </div>

                            <p className="mt-2 line-clamp-2 text-sm text-zinc-600">{exercise.description}</p>

                            <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                <span className="rounded-full border border-zinc-200 px-2 py-1 text-zinc-600">
                                    {exercise.category.toUpperCase()}
                                </span>
                                <span className="rounded-full border border-zinc-200 px-2 py-1 text-zinc-600">
                                    {exercise.difficulty}
                                </span>
                            </div>

                            <Link href={`/exercise/${exercise.id}`} className="mt-4 inline-block text-sm font-medium text-zinc-800 hover:underline">
                                Abrir exercicio
                            </Link>
                        </article>
                    ))}
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
