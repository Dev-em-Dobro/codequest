"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ChevronRight, Code2, Home, Lightbulb, Save, Send, Sparkles, Target } from "lucide-react";
import { Header } from "@/components/layout/header";
import { GlowCard } from "@/components/ui/spotlight-card";
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
        return "border-emerald-500/40 bg-emerald-900/20 text-emerald-300";
    }

    if (tone === "error") {
        return "border-red-500/40 bg-red-900/20 text-red-300";
    }

    return "border-blue-500/40 bg-blue-900/20 text-blue-300";
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
    const previewDocument = useMemo(() => {
        return `
            <html>
                <head>
                    <style>
                        body {
                            margin: 0;
                            min-height: 100vh;
                            background: #0b0b12;
                            font-family: Arial, sans-serif;
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

    return (
        <div className="min-h-screen bg-black">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center space-x-2 text-sm mb-6" style={{ color: "#fff6e9" }}>
                    <Link href="/" className="hover:text-purple-400 transition-colors flex items-center">
                        <Home className="w-4 h-4 mr-1" />
                        Inicio
                    </Link>
                    <ChevronRight className="w-4 h-4 text-zinc-600" />
                    <Link href={`/exercises/${exercise.category}`} className="hover:text-purple-400 transition-colors">
                        {exercise.category.toUpperCase()}
                    </Link>
                    <ChevronRight className="w-4 h-4 text-zinc-600" />
                    <span className="text-purple-400">{exercise.title}</span>
                </div>

                <GlowCard glowColor="purple" customSize className="p-6 mb-8">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-white">{exercise.title}</h1>
                            <p className="mt-2 text-sm text-slate-300">{exercise.description}</p>
                        </div>

                        <div className="flex flex-wrap gap-2 text-xs">
                            <span className="rounded-full border border-purple-500/40 bg-purple-500/20 px-2 py-1 text-purple-200">
                                {exercise.category.toUpperCase()}
                            </span>
                            <span className="rounded-full border border-blue-500/40 bg-blue-500/20 px-2 py-1 text-blue-200">
                                {exercise.difficulty}
                            </span>
                            <span className="rounded-full border border-amber-500/40 bg-amber-500/20 px-2 py-1 text-amber-200 number">
                                {exercise.points} XP
                            </span>
                            {progressCompleted ? (
                                <span className="rounded-full border border-emerald-500/40 bg-emerald-500/20 px-2 py-1 text-emerald-200">
                                    Concluido
                                </span>
                            ) : null}
                        </div>
                    </div>

                    {showAuthHint ? (
                        <div className="mt-4 rounded-lg border border-blue-500/30 bg-blue-900/20 p-3 text-sm text-blue-200">
                            Faca login para salvar codigo, acompanhar progresso e concluir este exercicio.
                        </div>
                    ) : null}
                </GlowCard>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-1 space-y-6">
                        <GlowCard glowColor="blue" customSize className="p-5">
                            <h2 className="text-lg font-semibold text-white flex items-center">
                                <Target className="w-5 h-5 mr-2 text-blue-400" />
                                Instrucoes
                            </h2>
                            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-200">{exercise.instructions}</p>

                            {hintText ? (
                                <div className="mt-4 rounded-lg border border-blue-500/30 bg-blue-900/20 p-3 text-sm text-blue-200">
                                    <div className="font-semibold mb-1 flex items-center">
                                        <Lightbulb className="w-4 h-4 mr-1" />
                                        Dica da IA
                                    </div>
                                    {hintText}
                                </div>
                            ) : null}

                            {reviewData ? (
                                <div className="mt-4 space-y-2 rounded-lg border border-zinc-700 bg-zinc-900/60 p-3 text-sm text-zinc-200">
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
                        </GlowCard>

                        <GlowCard glowColor="orange" customSize className="p-5">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                <Sparkles className="w-5 h-5 mr-2 text-orange-300" />
                                Acoes
                            </h3>

                            <div className="grid gap-2">
                                <button
                                    type="button"
                                    onClick={onSave}
                                    disabled={savePending}
                                    className="rpg-button flex items-center justify-center"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {savePending ? "Salvando..." : "Salvar Codigo"}
                                </button>

                                <button
                                    type="button"
                                    onClick={onValidate}
                                    disabled={validatePending}
                                    className="rpg-button flex items-center justify-center"
                                >
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    {validatePending ? "Validando..." : "Validar"}
                                </button>

                                <button
                                    type="button"
                                    onClick={onHint}
                                    disabled={hintPending}
                                    className="rpg-button flex items-center justify-center"
                                >
                                    <Lightbulb className="w-4 h-4 mr-2" />
                                    {hintPending ? "Gerando dica..." : "Pedir Dica IA"}
                                </button>

                                <button
                                    type="button"
                                    onClick={onReview}
                                    disabled={reviewPending}
                                    className="rpg-button flex items-center justify-center"
                                >
                                    <Code2 className="w-4 h-4 mr-2" />
                                    {reviewPending ? "Revisando..." : "Revisar com IA"}
                                </button>

                                <button
                                    type="button"
                                    onClick={onComplete}
                                    disabled={completePending || progressCompleted}
                                    className="rpg-button flex items-center justify-center disabled:opacity-50"
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    {completePending ? "Concluindo..." : progressCompleted ? "Ja Concluido" : "Concluir Exercicio"}
                                </button>
                            </div>

                            {statusMessage ? (
                                <p className={`mt-4 rounded-lg border px-3 py-2 text-sm ${statusClass(statusMessage.tone)}`}>
                                    {statusMessage.text}
                                </p>
                            ) : null}
                        </GlowCard>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <GlowCard glowColor="purple" customSize className="p-5">
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                                <Code2 className="w-5 h-5 mr-2 text-purple-300" />
                                Codigo
                            </h2>
                            <div className="grid gap-3">
                                <div>
                                    <label htmlFor="html" className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-300">
                                        HTML
                                    </label>
                                    <textarea
                                        id="html"
                                        value={code.html}
                                        onChange={(event) => onCodeChange("html", event.target.value)}
                                        rows={6}
                                        className="input-8bit w-full font-mono text-xs"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="css" className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-300">
                                        CSS
                                    </label>
                                    <textarea
                                        id="css"
                                        value={code.css}
                                        onChange={(event) => onCodeChange("css", event.target.value)}
                                        rows={6}
                                        className="input-8bit w-full font-mono text-xs"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="javascript" className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-300">
                                        JavaScript
                                    </label>
                                    <textarea
                                        id="javascript"
                                        value={code.javascript}
                                        onChange={(event) => onCodeChange("javascript", event.target.value)}
                                        rows={6}
                                        className="input-8bit w-full font-mono text-xs"
                                    />
                                </div>
                            </div>
                        </GlowCard>

                        <GlowCard glowColor="green" customSize className="p-5">
                            <h2 className="text-lg font-semibold text-white mb-4">Preview ao Vivo</h2>
                            <div className="rounded-lg border border-green-500/30 overflow-hidden bg-black min-h-[340px]">
                                <iframe
                                    title="Preview do exercicio"
                                    srcDoc={previewDocument}
                                    sandbox="allow-scripts"
                                    className="w-full h-[340px] bg-white"
                                />
                            </div>
                        </GlowCard>
                    </div>
                </div>
            </main>
        </div>
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
            <div className="min-h-screen bg-black">
                <Header />
                <main className="max-w-4xl mx-auto px-4 py-12">
                    <div className="rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-4 text-sm text-zinc-300">
                        Carregando exercicio...
                    </div>
                </main>
            </div>
        );
    }

    if (exerciseQuery.isError || !exerciseQuery.data) {
        return (
            <div className="min-h-screen bg-black">
                <Header />
                <main className="max-w-4xl mx-auto px-4 py-12">
                    <div className="w-full max-w-xl rounded-xl border border-red-500/40 bg-red-950/40 p-6 text-sm text-red-300">
                        Nao foi possivel carregar este exercicio.
                    </div>
                </main>
            </div>
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
