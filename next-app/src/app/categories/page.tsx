"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiClient } from "@/lib/api-client";

type ExerciseCategory = "html" | "css" | "javascript";

type Exercise = {
    id: string;
    title: string;
    category: ExerciseCategory;
    difficulty: "iniciante" | "intermediario" | "avancado";
    points: number;
};

type UserProgress = {
    exerciseId: string;
    completed: boolean;
    pointsEarned: number;
};

type CategoryCard = {
    id: ExerciseCategory;
    title: string;
    description: string;
    route: string;
};

const categoryCards: CategoryCard[] = [
    {
        id: "html",
        title: "HTML",
        description: "Estrutura e semantica para construir paginas web.",
        route: "/exercises/html",
    },
    {
        id: "css",
        title: "CSS",
        description: "Estilizacao e layout para interfaces modernas.",
        route: "/exercises/css",
    },
    {
        id: "javascript",
        title: "JavaScript",
        description: "Interatividade, logica e comportamento da aplicacao.",
        route: "/exercises/javascript",
    },
];

export default function CategoriesPage() {
    const { isAuthenticated } = useAuth();
    const showAuthHint = !isAuthenticated;

    const exercisesQuery = useQuery({
        queryKey: ["/api/exercises"],
        queryFn: () => apiClient<Exercise[]>("/exercises"),
        staleTime: 5 * 60 * 1000,
    });

    const progressQuery = useQuery({
        queryKey: ["/api/progress"],
        queryFn: () => apiClient<UserProgress[]>("/progress"),
        enabled: isAuthenticated,
        staleTime: 60 * 1000,
    });

    const exercises = exercisesQuery.data ?? [];
    const progress = progressQuery.data ?? [];
    const completedProgress = progress.filter((entry) => entry.completed);

    const statsByCategory = categoryCards.map((category) => {
        const categoryExercises = exercises.filter((exercise) => exercise.category === category.id);
        const completedInCategory = completedProgress.filter((entry) =>
            categoryExercises.some((exercise) => exercise.id === entry.exerciseId),
        );

        const totalExercises = categoryExercises.length;
        const completedCount = completedInCategory.length;
        const completionPercentage = totalExercises > 0 ? Math.round((completedCount / totalExercises) * 100) : 0;
        const totalPoints = categoryExercises.reduce((accumulator, exercise) => accumulator + Number(exercise.points || 0), 0);

        return {
            ...category,
            totalExercises,
            completedCount,
            completionPercentage,
            totalPoints,
        };
    });

    const isLoading = exercisesQuery.isLoading || (isAuthenticated && progressQuery.isLoading);
    const hasError = exercisesQuery.isError || progressQuery.isError;

    if (isLoading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 text-zinc-900">
                <div className="rounded-xl border border-zinc-200 bg-white px-6 py-4 text-sm text-zinc-600 shadow-sm">
                    Carregando categorias...
                </div>
            </main>
        );
    }

    if (hasError) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 text-zinc-900">
                <div className="w-full max-w-xl rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
                    Nao foi possivel carregar os dados das categorias.
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900">
            <div className="mx-auto w-full max-w-5xl space-y-6">
                <header className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <h1 className="text-2xl font-semibold tracking-tight">Categorias de Exercicios</h1>
                    <p className="mt-2 text-sm text-zinc-600">
                        Explore os trilhos de estudo e acompanhe seu progresso por tecnologia.
                    </p>
                    {showAuthHint ? (
                        <p className="mt-3 text-sm text-zinc-500">
                            Faca login para ver seu progresso completo por categoria.
                        </p>
                    ) : null}
                </header>

                <section className="grid gap-4 md:grid-cols-3">
                    {statsByCategory.map((category) => (
                        <article key={category.id} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                            <h2 className="text-lg font-semibold tracking-tight">{category.title}</h2>
                            <p className="mt-2 text-sm text-zinc-600">{category.description}</p>

                            <div className="mt-4 space-y-2 text-sm">
                                <p className="text-zinc-700">
                                    Exercicios: <strong>{category.completedCount}</strong> / {category.totalExercises}
                                </p>
                                <p className="text-zinc-700">
                                    Progresso: <strong>{category.completionPercentage}%</strong>
                                </p>
                                <p className="text-zinc-700">
                                    Pontos disponiveis: <strong>{category.totalPoints}</strong>
                                </p>
                            </div>

                            <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-200">
                                <div
                                    className="h-full rounded-full bg-zinc-900 transition-all"
                                    style={{ width: `${category.completionPercentage}%` }}
                                />
                            </div>

                            <Link
                                href={category.route}
                                className="mt-5 inline-block text-sm font-medium text-zinc-800 hover:underline"
                            >
                                Ver exercicios
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
