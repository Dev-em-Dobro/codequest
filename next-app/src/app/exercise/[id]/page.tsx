"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";

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
    category: "html" | "css" | "javascript";
    points: number;
    initialCode: CodeTriplet;
};

type Progress = {
    exerciseId: string;
    completed: boolean;
    userCode: CodeTriplet;
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

type AiHintResponse = {
    hint: string;
};

type AiReviewResponse = {
    feedback: string;
    suggestions: string[];
    score?: number;
    isCorrect?: boolean;
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
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }

    if (tone === "error") {
        return "border-red-200 bg-red-50 text-red-700";
    }

    return "border-blue-200 bg-blue-50 text-blue-700";
}

type ExerciseDetailContentProps = Readonly<{
    exercise: Exercise;
    progressCompleted: boolean;
    showAuthHint: boolean;
    hintText: string | null;
    reviewData: AiReviewResponse | null;
    code: CodeTriplet;
    onCodeChange: (field: keyof CodeTriplet, value: string) => void;
    onSave: () => void;
    onValidate: () => void;
    onHint: () => void;
    onReview: () => void;
    onComplete: () => void;
    savePending: boolean;
    validatePending: boolean;
    hintPending: boolean;
    reviewPending: boolean;
    completePending: boolean;
    statusMessage: StatusMessage | null;
}>;

function ExerciseDetailContent({
    exercise,
    progressCompleted,
    showAuthHint,
    hintText,
    reviewData,
    code,
    onCodeChange,
    onSave,
    onValidate,
    onHint,
    onReview,
    onComplete,
    savePending,
    validatePending,
    hintPending,
    reviewPending,
    completePending,
    statusMessage,
}: ExerciseDetailContentProps) {
    return (
        <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-900">
            <div className="mx-auto w-full max-w-6xl space-y-6">
                <header className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <h1 className="text-2xl font-semibold tracking-tight">{exercise.title}</h1>
                    <p className="mt-2 text-sm text-zinc-600">{exercise.description}</p>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full border border-zinc-200 px-2 py-1 text-zinc-700">{exercise.category.toUpperCase()}</span>
                        <span className="rounded-full border border-zinc-200 px-2 py-1 text-zinc-700">{exercise.difficulty}</span>
                        <span className="rounded-full border border-zinc-200 px-2 py-1 text-zinc-700">{exercise.points} pts</span>
                        {progressCompleted ? (
                            <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2 py-1 text-emerald-700">Concluido</span>
                        ) : null}
                    </div>

                    {showAuthHint ? (
                        <p className="mt-3 text-sm text-zinc-500">
                            Faca login para salvar codigo, acompanhar progresso e concluir este exercicio.
                        </p>
                    ) : null}
                </header>

                <section className="grid gap-4 lg:grid-cols-2">
                    <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                        <h2 className="text-lg font-semibold tracking-tight">Instrucoes</h2>
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-700">{exercise.instructions}</p>

                        {hintText ? (
                            <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">{hintText}</div>
                        ) : null}

                        {reviewData ? (
                            <div className="mt-4 space-y-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700">
                                <p>
                                    <strong>Feedback IA:</strong> {reviewData.feedback}
                                </p>
                                {reviewData.suggestions.length > 0 ? (
                                    <ul className="list-disc space-y-1 pl-5">
                                        {reviewData.suggestions.map((suggestion) => (
                                            <li key={suggestion}>{suggestion}</li>
                                        ))}
                                    </ul>
                                ) : null}
                            </div>
                        ) : null}
                    </article>

                    <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                        <h2 className="text-lg font-semibold tracking-tight">Codigo</h2>
                        <div className="mt-3 space-y-3">
                            <div>
                                <label htmlFor="html" className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-600">
                                    HTML
                                </label>
                                <textarea
                                    id="html"
                                    value={code.html}
                                    onChange={(event) => onCodeChange("html", event.target.value)}
                                    rows={6}
                                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-xs outline-none ring-zinc-900/10 focus:ring"
                                />
                            </div>

                            <div>
                                <label htmlFor="css" className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-600">
                                    CSS
                                </label>
                                <textarea
                                    id="css"
                                    value={code.css}
                                    onChange={(event) => onCodeChange("css", event.target.value)}
                                    rows={6}
                                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-xs outline-none ring-zinc-900/10 focus:ring"
                                />
                            </div>

                            <div>
                                <label htmlFor="javascript" className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-600">
                                    JavaScript
                                </label>
                                <textarea
                                    id="javascript"
                                    value={code.javascript}
                                    onChange={(event) => onCodeChange("javascript", event.target.value)}
                                    rows={6}
                                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-xs outline-none ring-zinc-900/10 focus:ring"
                                />
                            </div>
                        </div>
                    </article>
                </section>

                <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={onSave}
                            disabled={savePending}
                            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {savePending ? "Salvando..." : "Salvar codigo"}
                        </button>

                        <button
                            type="button"
                            onClick={onValidate}
                            disabled={validatePending}
                            className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {validatePending ? "Validando..." : "Validar"}
                        </button>

                        <button
                            type="button"
                            onClick={onHint}
                            disabled={hintPending}
                            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {hintPending ? "Gerando dica..." : "Pedir dica IA"}
                        </button>

                        <button
                            type="button"
                            onClick={onReview}
                            disabled={reviewPending}
                            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {reviewPending ? "Revisando..." : "Revisar com IA"}
                        </button>

                        <button
                            type="button"
                            onClick={onComplete}
                            disabled={completePending || progressCompleted}
                            className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {completePending ? "Concluindo..." : "Marcar como concluido"}
                        </button>
                    </div>

                    {statusMessage ? (
                        <p className={`mt-4 rounded-lg border px-3 py-2 text-sm ${statusClass(statusMessage.tone)}`}>
                            {statusMessage.text}
                        </p>
                    ) : null}
                </section>

                <div className="flex gap-4 text-sm">
                    <Link href="/exercise" className="font-medium text-zinc-700 hover:underline">
                        Voltar para lista de exercicios
                    </Link>
                    <Link href="/categories" className="font-medium text-zinc-700 hover:underline">
                        Ver categorias
                    </Link>
                </div>
            </div>
        </main>
    );
}

export default function ExerciseDetailPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const queryClient = useQueryClient();
    const { isAuthenticated } = useAuth();

    const exerciseId = params.id ?? "";

    const [draftCode, setDraftCode] = useState<{ exerciseId: string; code: CodeTriplet } | null>(null);
    const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);
    const [hintText, setHintText] = useState<string | null>(null);
    const [reviewData, setReviewData] = useState<AiReviewResponse | null>(null);

    const exerciseQuery = useQuery({
        queryKey: ["/api/exercises", exerciseId],
        queryFn: () => apiClient<Exercise>(`/exercises/${exerciseId}`),
        enabled: Boolean(exerciseId),
        staleTime: 5 * 60 * 1000,
    });

    const progressQuery = useQuery({
        queryKey: ["/api/progress", exerciseId],
        queryFn: () => apiClient<Progress>(`/progress/${exerciseId}`),
        enabled: Boolean(exerciseId && isAuthenticated),
        retry: false,
        staleTime: 30 * 1000,
    });

    const exerciseBaseCode = exerciseQuery.data ? normalizeCode(exerciseQuery.data.initialCode) : emptyCode();
    const progressCode = progressQuery.data?.userCode ? normalizeCode(progressQuery.data.userCode) : null;
    const initialCode = progressCode ?? exerciseBaseCode;
    const code = draftCode?.exerciseId === exerciseId ? draftCode.code : initialCode;

    const updateCode = (field: keyof CodeTriplet, value: string) => {
        setDraftCode({
            exerciseId,
            code: {
                ...code,
                [field]: value,
            },
        });
    };

    const saveCodeMutation = useMutation({
        mutationFn: () =>
            apiClient<Progress>("/code/save", {
                method: "POST",
                body: {
                    exerciseId,
                    userCode: code,
                },
            }),
        onSuccess: () => {
            setStatusMessage({ tone: "success", text: "Codigo salvo com sucesso." });
            void queryClient.invalidateQueries({ queryKey: ["/api/progress", exerciseId] });
        },
        onError: (error) => {
            setStatusMessage({ tone: "error", text: error instanceof Error ? error.message : "Falha ao salvar codigo." });
        },
    });

    const validateMutation = useMutation({
        mutationFn: () =>
            apiClient<ValidationResponse>(`/exercises/${exerciseId}/validate`, {
                method: "POST",
                body: { userCode: code },
            }),
        onSuccess: (result) => {
            const firstMessage = result.results[0]?.message ?? "Validacao concluida.";
            const scoreLabel = Math.round(result.overallScore);
            const prefix = result.isValid ? "Codigo valido" : "Codigo incompleto";
            const jsOutput = result.jsOutput ? ` Saida JS: ${result.jsOutput}` : "";
            setStatusMessage({ tone: result.isValid ? "success" : "info", text: `${prefix} (${scoreLabel}%). ${firstMessage}${jsOutput}` });
        },
        onError: (error) => {
            setStatusMessage({ tone: "error", text: error instanceof Error ? error.message : "Falha ao validar codigo." });
        },
    });

    const completeMutation = useMutation({
        mutationFn: () =>
            apiClient<Progress>(`/exercises/${exerciseId}/complete`, {
                method: "POST",
                body: { userCode: code },
            }),
        onSuccess: () => {
            setStatusMessage({ tone: "success", text: "Exercicio concluido e pontos creditados." });
            void queryClient.invalidateQueries({ queryKey: ["/api/progress", exerciseId] });
            void queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        },
        onError: (error) => {
            setStatusMessage({ tone: "error", text: error instanceof Error ? error.message : "Falha ao concluir exercicio." });
        },
    });

    const hintMutation = useMutation({
        mutationFn: () =>
            apiClient<AiHintResponse>(`/exercises/${exerciseId}/ai-hint`, {
                method: "POST",
                body: { userCode: code },
            }),
        onSuccess: (result) => {
            setHintText(result.hint);
            setStatusMessage({ tone: "info", text: "Dica gerada com sucesso." });
        },
        onError: (error) => {
            setStatusMessage({ tone: "error", text: error instanceof Error ? error.message : "Falha ao gerar dica." });
        },
    });

    const reviewMutation = useMutation({
        mutationFn: () =>
            apiClient<AiReviewResponse>(`/exercises/${exerciseId}/ai-review`, {
                method: "POST",
                body: { userCode: code },
            }),
        onSuccess: (result) => {
            setReviewData(result);
            setStatusMessage({ tone: "info", text: "Revisao de IA concluida." });
        },
        onError: (error) => {
            setStatusMessage({ tone: "error", text: error instanceof Error ? error.message : "Falha na revisao de IA." });
        },
    });

    const handleSaveCode = () => {
        if (!isAuthenticated) {
            const redirectPath = "/exercise/" + exerciseId;
            router.push("/auth/signin?redirect=" + encodeURIComponent(redirectPath));
            return;
        }

        saveCodeMutation.mutate();
    };

    const handleComplete = () => {
        if (!isAuthenticated) {
            const redirectPath = "/exercise/" + exerciseId;
            router.push("/auth/signin?redirect=" + encodeURIComponent(redirectPath));
            return;
        }

        if (progressQuery.data?.completed) {
            setStatusMessage({ tone: "info", text: "Este exercicio ja esta concluido para sua conta." });
            return;
        }

        completeMutation.mutate();
    };

    if (exerciseQuery.isLoading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 text-zinc-900">
                <div className="rounded-xl border border-zinc-200 bg-white px-6 py-4 text-sm text-zinc-600 shadow-sm">
                    Carregando exercicio...
                </div>
            </main>
        );
    }

    if (exerciseQuery.isError || !exerciseQuery.data) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 text-zinc-900">
                <div className="w-full max-w-xl rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
                    Nao foi possivel carregar este exercicio.
                </div>
            </main>
        );
    }

    const exercise = exerciseQuery.data;
    const showAuthHint = isAuthenticated === false;

    return (
        <ExerciseDetailContent
            exercise={exercise}
            progressCompleted={Boolean(progressQuery.data?.completed)}
            showAuthHint={showAuthHint}
            hintText={hintText}
            reviewData={reviewData}
            code={code}
            onCodeChange={updateCode}
            onSave={handleSaveCode}
            onValidate={() => validateMutation.mutate()}
            onHint={() => hintMutation.mutate()}
            onReview={() => reviewMutation.mutate()}
            onComplete={handleComplete}
            savePending={saveCodeMutation.isPending}
            validatePending={validateMutation.isPending}
            hintPending={hintMutation.isPending}
            reviewPending={reviewMutation.isPending}
            completePending={completeMutation.isPending}
            statusMessage={statusMessage}
        />
    );
}
