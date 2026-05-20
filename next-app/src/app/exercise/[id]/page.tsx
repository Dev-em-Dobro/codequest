"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Check,
    ChevronRight,
    Eye,
    Gem,
    Home,
    Play,
    Sparkles,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { CodeEditor } from "@/components/code-editor";
import { useAuth } from "@/hooks/use-auth";
import { apiClient } from "@/lib/api-client";

type ExerciseCategory = "html" | "css" | "javascript";

type CodeTriplet = {
    html: string;
    css: string;
    javascript: string;
};

type Exercise = {
    id: string;
    title: string;
    description: string;
    instructions: string;
    difficulty: "iniciante" | "intermediario" | "avancado";
    category: ExerciseCategory;
    points: number;
    order?: number;
    initialCode?: Partial<CodeTriplet>;
    hints?: string[];
};

type ProgressEntry = {
    exerciseId: string;
    completed: boolean;
    userCode?: Partial<CodeTriplet>;
    pointsEarned: number;
};

type ValidationResult = {
    isValid: boolean;
    message: string;
    score: number;
};

type ValidationResponse = {
    isValid: boolean;
    overallScore: number;
    results: ValidationResult[];
    jsOutput?: string;
};

type StatusMessage = {
    tone: "info" | "success" | "error";
    text: string;
};

function normalizeCode(code: Partial<CodeTriplet> | undefined): CodeTriplet {
    return {
        html: typeof code?.html === "string" ? code.html : "",
        css: typeof code?.css === "string" ? code.css : "",
        javascript: typeof code?.javascript === "string" ? code.javascript : "",
    };
}

function emptyCode(): CodeTriplet {
    return { html: "", css: "", javascript: "" };
}

function statusClass(tone: StatusMessage["tone"]): string {
    if (tone === "success") {
        return "border-green-500/50 bg-green-900/25 text-green-200";
    }

    if (tone === "error") {
        return "border-red-500/50 bg-red-900/25 text-red-200";
    }

    return "border-blue-500/50 bg-blue-900/25 text-blue-200";
}

function formatDifficulty(difficulty: Exercise["difficulty"]): string {
    if (difficulty === "intermediario") {
        return "Intermediario";
    }

    if (difficulty === "avancado") {
        return "Avancado";
    }

    return "Iniciante";
}

export default function ExerciseDetailPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const queryClient = useQueryClient();
    const { isAuthenticated } = useAuth();

    const exerciseId = typeof params.id === "string" ? params.id : "";
    const [draftCode, setDraftCode] = useState<{ exerciseId: string; code: CodeTriplet } | null>(null);
    const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);
    const [showTips, setShowTips] = useState(false);

    const exerciseQuery = useQuery({
        queryKey: ["/api/exercises", exerciseId],
        queryFn: () => apiClient<Exercise>(`/exercises/${exerciseId}`),
        enabled: Boolean(exerciseId),
        staleTime: 5 * 60 * 1000,
    });

    const exercisesQuery = useQuery({
        queryKey: ["/api/exercises"],
        queryFn: () => apiClient<Exercise[]>("/exercises"),
        staleTime: 5 * 60 * 1000,
    });

    const progressQuery = useQuery({
        queryKey: ["/api/progress", exerciseId],
        queryFn: () => apiClient<ProgressEntry>(`/progress/${exerciseId}`),
        enabled: Boolean(exerciseId && isAuthenticated),
        retry: false,
        staleTime: 30 * 1000,
    });

    const progressListQuery = useQuery({
        queryKey: ["/api/progress"],
        queryFn: () => apiClient<ProgressEntry[]>("/progress"),
        enabled: isAuthenticated,
        retry: false,
        staleTime: 30 * 1000,
    });

    const exerciseBaseCode = exerciseQuery.data ? normalizeCode(exerciseQuery.data.initialCode) : emptyCode();
    const progressCode = progressQuery.data?.userCode ? normalizeCode(progressQuery.data.userCode) : null;
    const initialCode = progressCode ?? exerciseBaseCode;
    const code = draftCode?.exerciseId === exerciseId ? draftCode.code : initialCode;

    const previewDocument = useMemo(() => {
        return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body {
            margin: 0;
            padding: 20px;
            font-family: Inter, Arial, sans-serif;
            line-height: 1.6;
          }
          ${code.css}
        </style>
      </head>
      <body>
        ${code.html}
        <script>
          try {
            ${code.javascript}
          } catch (error) {
            console.error(error);
          }
        </script>
      </body>
      </html>
    `;
    }, [code.css, code.html, code.javascript]);

    const sidebarExercises = useMemo(() => {
        const exercises = exercisesQuery.data ?? [];
        const category = exerciseQuery.data?.category;

        if (!category) {
            return exercises.sort((left, right) => (left.order ?? 0) - (right.order ?? 0));
        }

        return exercises
            .filter((exercise) => exercise.category === category)
            .sort((left, right) => (left.order ?? 0) - (right.order ?? 0));
    }, [exercisesQuery.data, exerciseQuery.data?.category]);

    const sidebarProgress = isAuthenticated ? (progressListQuery.data ?? []) : [];
    const completedInCategory = sidebarProgress.filter(
        (progress) => progress.completed && sidebarExercises.some((exercise) => exercise.id === progress.exerciseId),
    ).length;
    const totalInCategory = sidebarExercises.length;
    const progressPercentage = totalInCategory > 0 ? Math.round((completedInCategory / totalInCategory) * 100) : 0;

    const hasVisualOutput = code.html.trim().length > 0 || code.css.trim().length > 0;

    const saveCodeMutation = useMutation({
        mutationFn: () =>
            apiClient<ProgressEntry>("/code/save", {
                method: "POST",
                body: {
                    exerciseId,
                    userCode: code,
                },
            }),
    });

    const validateMutation = useMutation({
        mutationFn: () =>
            apiClient<ValidationResponse>(`/exercises/${exerciseId}/validate`, {
                method: "POST",
                body: {
                    userCode: code,
                },
            }),
    });

    const completeMutation = useMutation({
        mutationFn: () =>
            apiClient<ProgressEntry>(`/exercises/${exerciseId}/complete`, {
                method: "POST",
                body: {
                    userCode: code,
                },
            }),
    });

    const updateCode = (nextCode: CodeTriplet) => {
        setDraftCode({
            exerciseId,
            code: nextCode,
        });
    };

    const navigateToSignIn = () => {
        const redirectPath = `/exercise/${exerciseId}`;
        router.push(`/auth/signin?redirect=${encodeURIComponent(redirectPath)}`);
    };

    const handleSaveCode = async () => {
        if (!isAuthenticated) {
            navigateToSignIn();
            return;
        }

        try {
            await saveCodeMutation.mutateAsync();
            setStatusMessage({
                tone: "success",
                text: "Codigo salvo com sucesso.",
            });
            void queryClient.invalidateQueries({ queryKey: ["/api/progress", exerciseId] });
            void queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
        } catch (error) {
            setStatusMessage({
                tone: "error",
                text: error instanceof Error ? error.message : "Falha ao salvar codigo.",
            });
        }
    };

    const handleSubmitForCorrection = async () => {
        if (!isAuthenticated) {
            navigateToSignIn();
            return;
        }

        try {
            const validation = await validateMutation.mutateAsync();

            if (!validation.isValid) {
                const firstFailure = validation.results.find((result) => !result.isValid);
                const firstMessage = firstFailure?.message ?? "Sua solucao ainda nao atende os requisitos.";
                const outputInfo = validation.jsOutput ? ` Saida JS: ${validation.jsOutput}` : "";
                setStatusMessage({
                    tone: "error",
                    text: `${Math.round(validation.overallScore)}% correto. ${firstMessage}${outputInfo}`,
                });
                return;
            }

            if (!progressQuery.data?.completed) {
                await completeMutation.mutateAsync();
                setStatusMessage({
                    tone: "success",
                    text: `Parabens! Exercicio concluido com ${Math.round(validation.overallScore)}% de precisao.`,
                });

                void queryClient.invalidateQueries({ queryKey: ["/api/progress", exerciseId] });
                void queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
                void queryClient.invalidateQueries({ queryKey: ["/api/user"] });
                return;
            }

            setStatusMessage({
                tone: "success",
                text: `Codigo validado com sucesso (${Math.round(validation.overallScore)}%).`,
            });
        } catch (error) {
            setStatusMessage({
                tone: "error",
                text: error instanceof Error ? error.message : "Falha ao validar o exercicio.",
            });
        }
    };

    if (exerciseQuery.isLoading) {
        return (
            <div className="min-h-screen bg-black">
                <Header />
                <div className="flex min-h-[calc(100vh-80px)] items-center justify-center">
                    <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-200">
                        Carregando exercicio...
                    </div>
                </div>
            </div>
        );
    }

    if (exerciseQuery.isError || !exerciseQuery.data) {
        return (
            <div className="min-h-screen bg-black">
                <Header />
                <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4">
                    <div className="w-full max-w-xl rounded-lg border border-red-500/40 bg-red-950/40 p-5 text-sm text-red-200">
                        Nao foi possivel carregar este exercicio.
                    </div>
                </div>
            </div>
        );
    }

    const exercise = exerciseQuery.data;

    return (
        <div className="min-h-screen bg-black">
            <Header />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <nav aria-label="Breadcrumb">
                    <ol className="flex items-center space-x-2 text-xs sm:text-sm">
                        <li>
                            <Link href="/" className="flex items-center text-slate-400 hover:text-purple-400 transition-colors">
                                <Home className="w-3.5 h-3.5 mr-1" />
                                Inicio
                            </Link>
                        </li>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                        <li>
                            <Link
                                href={`/exercises/${exercise.category}`}
                                className="text-slate-400 hover:text-purple-400 transition-colors"
                            >
                                Exercicios {exercise.category.toUpperCase()}
                            </Link>
                        </li>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                        <li className="text-purple-400 font-medium">{exercise.title}</li>
                    </ol>
                </nav>
            </div>

            <div className="flex min-h-[calc(100vh-128px)]">
                <aside className="w-80 border-r border-[#2f3a3c] bg-[#172122]">
                    <div className="h-[calc(100vh-128px)] overflow-y-auto p-4">
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-white mb-3" style={{ fontFamily: "var(--font-retro)" }}>
                                Seu Progresso
                            </h2>
                            <div className="h-2 w-full rounded-full bg-[#2f3a3c] overflow-hidden">
                                <div
                                    className="h-full bg-[#9d4edd] transition-all duration-300"
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </div>
                            <p className="mt-2 text-sm text-white/75">
                                <span className="number">{completedInCategory}</span> de <span className="number">{totalInCategory}</span> exercicios concluidos
                                {exercise.category ? ` (${exercise.category.toUpperCase()})` : ""}
                            </p>
                        </div>

                        <h3 className="mb-3 text-sm font-semibold text-white" style={{ fontFamily: "var(--font-inter)" }}>
                            Exercicios - {exercise.category.charAt(0).toUpperCase() + exercise.category.slice(1)}
                        </h3>

                        <div className="space-y-3">
                            {sidebarExercises.map((item) => {
                                const itemCompleted = sidebarProgress.some(
                                    (progress) => progress.exerciseId === item.id && progress.completed,
                                );
                                const isCurrentExercise = item.id === exerciseId;

                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => {
                                            if (!isCurrentExercise) {
                                                router.push(`/exercise/${item.id}`);
                                            }
                                        }}
                                        className={`w-full rounded-lg border p-3 text-left transition-colors ${itemCompleted
                                            ? "border-green-400/70 bg-green-600/40 hover:bg-green-600/50"
                                            : isCurrentExercise
                                                ? "border-[#9d4edd] bg-[#9d4edd]/10"
                                                : "border-white/15 bg-black/20 hover:bg-white/10"
                                            }`}
                                    >
                                        <div className="flex items-center">
                                            <div
                                                className={`mr-3 flex h-7 w-7 items-center justify-center rounded-full ${itemCompleted
                                                    ? "bg-green-500"
                                                    : isCurrentExercise
                                                        ? "bg-[#9d4edd]"
                                                        : "bg-white/20"
                                                    }`}
                                            >
                                                {itemCompleted ? (
                                                    <Check className="h-4 w-4 text-white" />
                                                ) : isCurrentExercise ? (
                                                    <Play className="h-3 w-3 text-white" />
                                                ) : (
                                                    <span className="number text-xs text-white">{item.order ?? "-"}</span>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-white" style={{ fontFamily: "var(--font-inter)" }}>
                                                    {item.title}
                                                </p>
                                                <p className="text-xs text-white/70" style={{ fontFamily: "var(--font-inter)" }}>
                                                    {formatDifficulty(item.difficulty)} - <span className="number">{item.points}</span> pontos
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </aside>

                <main className="flex-1 p-4 sm:p-6">
                    <section className="rounded-lg border border-gray-300 bg-[#f4f4f4] p-4 shadow-sm">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <h1 className="text-[38px] font-bold text-[#1f2937]">{exercise.title}</h1>
                                <p className="mt-1 text-sm text-gray-600">Exercicio {exercise.order ?? "-"}</p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-sm">
                                <span className="text-gray-700">Nivel {formatDifficulty(exercise.difficulty)}</span>
                                <span className="inline-flex items-center gap-1 text-amber-600">
                                    <Gem className="h-4 w-4" />
                                    <span className="number">{exercise.points}</span> pontos
                                </span>
                            </div>
                        </div>

                        <div className="mt-4 rounded-md border border-blue-100 bg-[#e7edf8] p-4">
                            <h2 className="text-lg font-semibold text-blue-900">📝 Instrucoes do Exercicio</h2>
                            <p className="mt-2 leading-relaxed text-blue-800">{exercise.instructions}</p>

                            {exercise.category === "javascript" ? (
                                <div className="mt-3 border-l-4 border-yellow-500 bg-yellow-100 p-3 text-sm text-yellow-800">
                                    <strong>Importante para JavaScript:</strong> quando executar o codigo, abra o DevTools do navegador com F12 e visualize a execucao na aba Console.
                                </div>
                            ) : null}

                            {showTips && exercise.hints && exercise.hints.length > 0 ? (
                                <div className="mt-3 rounded-md border border-purple-200 bg-white p-3">
                                    <p className="text-sm font-semibold text-purple-900">Dicas:</p>
                                    <ul className="mt-2 space-y-1 text-sm text-purple-900">
                                        {exercise.hints.map((hint) => (
                                            <li key={hint}>• {hint}</li>
                                        ))}
                                    </ul>
                                </div>
                            ) : null}
                        </div>

                        {progressQuery.data?.completed ? (
                            <div className="mt-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                                Exercicio concluido. Pontos recebidos: <span className="number">{exercise.points}</span>
                            </div>
                        ) : null}

                        <div className="mt-3 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setShowTips((current) => !current)}
                                className="rpg-button inline-flex items-center px-4 py-2 text-sm"
                            >
                                Dicas
                            </button>
                        </div>
                    </section>

                    <section className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
                        <div className="rounded-xl border border-zinc-700 bg-[#0b0c10] p-4">
                            <h3 className="text-3xl text-white" style={{ fontFamily: "var(--font-retro)" }}>
                                Editor de Codigo
                            </h3>
                            <p className="mt-1 text-sm text-slate-300">Escreva seu codigo abaixo</p>

                            <div className="mt-3 overflow-hidden rounded-md border border-zinc-700 bg-black/20">
                                <CodeEditor
                                    initialCode={code}
                                    onChange={updateCode}
                                    exerciseCategory={exercise.category}
                                />
                            </div>

                            <div className="mt-3 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        void handleSaveCode();
                                    }}
                                    disabled={saveCodeMutation.isPending}
                                    className="rpg-button inline-flex items-center px-4 py-2 text-sm disabled:opacity-50"
                                >
                                    {saveCodeMutation.isPending ? "Salvando..." : "Salvar Codigo"}
                                </button>
                            </div>
                        </div>

                        <div className="rounded-xl border border-zinc-700 bg-[#0b0c10] p-4">
                            <h3 className="text-3xl text-white" style={{ fontFamily: "var(--font-retro)" }}>
                                Visualizacao
                            </h3>
                            <p className="mt-1 text-sm text-slate-300">Veja o resultado do seu codigo em tempo real</p>

                            <div className="mt-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        void handleSubmitForCorrection();
                                    }}
                                    disabled={validateMutation.isPending || completeMutation.isPending}
                                    className="rpg-button inline-flex items-center px-4 py-2 text-sm disabled:opacity-50"
                                >
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    {validateMutation.isPending || completeMutation.isPending
                                        ? "Corrigindo..."
                                        : "Enviar para correcao"}
                                </button>
                            </div>

                            <div className="mt-3 overflow-hidden rounded-md border border-zinc-700 bg-[#f3f4f6]">
                                {hasVisualOutput ? (
                                    <iframe
                                        title="Preview do exercicio"
                                        srcDoc={previewDocument}
                                        sandbox="allow-scripts"
                                        className="h-[420px] w-full bg-white"
                                    />
                                ) : (
                                    <div className="flex h-[420px] flex-col items-center justify-center px-6 text-center text-slate-500">
                                        <Eye className="mb-3 h-10 w-10 text-slate-400" />
                                        <p>Comece a escrever codigo para ver o resultado aqui.</p>
                                    </div>
                                )}
                            </div>

                            {statusMessage ? (
                                <p className={`mt-3 rounded-md border px-3 py-2 text-sm ${statusClass(statusMessage.tone)}`}>
                                    {statusMessage.text}
                                </p>
                            ) : null}
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}
