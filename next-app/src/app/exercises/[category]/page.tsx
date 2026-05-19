"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
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

const validCategories = new Set<ExerciseCategory>(["html", "css", "javascript"]);

function isValidCategory(value: string): value is ExerciseCategory {
    return validCategories.has(value as ExerciseCategory);
}

export default function ExercisesByCategoryPage() {
    const params = useParams<{ category: string }>();
    const categoryParam = params.category?.toLowerCase() ?? "";
    const isCategoryValid = isValidCategory(categoryParam);

    const exercisesQuery = useQuery({
        queryKey: ["/api/exercises", categoryParam],
        queryFn: () => apiClient<Exercise[]>(`/exercises?category=${categoryParam}`),
        enabled: isCategoryValid,
        staleTime: 5 * 60 * 1000,
    });

    if (!isCategoryValid) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 text-zinc-900">
                <div className="w-full max-w-xl rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-700 shadow-sm">
                    Categoria invalida. Use /exercises/html, /exercises/css ou /exercises/javascript.
                </div>
            </main>
        );
    }

    if (exercisesQuery.isLoading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 text-zinc-900">
                <div className="rounded-xl border border-zinc-200 bg-white px-6 py-4 text-sm text-zinc-600 shadow-sm">
                    Carregando exercicios da categoria...
                </div>
            </main>
        );
    }

    if (exercisesQuery.isError) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 text-zinc-900">
                <div className="w-full max-w-xl rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
                    Nao foi possivel carregar os exercicios desta categoria.
                </div>
            </main>
        );
    }

    const exercises = exercisesQuery.data ?? [];

    return (
        <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900">
            <div className="mx-auto w-full max-w-5xl space-y-6">
                <header className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <h1 className="text-2xl font-semibold tracking-tight">Categoria: {categoryParam.toUpperCase()}</h1>
                    <p className="mt-2 text-sm text-zinc-600">Lista filtrada de exercicios desta trilha.</p>
                </header>

                {exercises.length === 0 ? (
                    <section className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
                        Nenhum exercicio encontrado para esta categoria.
                    </section>
                ) : (
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

                                <div className="mt-3 text-xs text-zinc-600">Dificuldade: {exercise.difficulty}</div>

                                <Link
                                    href={`/exercise/${exercise.id}`}
                                    className="mt-4 inline-block text-sm font-medium text-zinc-800 hover:underline"
                                >
                                    Abrir exercicio
                                </Link>
                            </article>
                        ))}
                    </section>
                )}

                <div className="flex gap-4 text-sm">
                    <Link href="/categories" className="font-medium text-zinc-700 hover:underline">
                        Voltar para categorias
                    </Link>
                    <Link href="/exercise" className="font-medium text-zinc-700 hover:underline">
                        Ver todos os exercicios
                    </Link>
                </div>
            </div>
        </main>
    );
}
