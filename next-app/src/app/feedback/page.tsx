"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiClient } from "@/lib/api-client";

export default function FeedbackPage() {
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const [feedback, setFeedback] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const sendFeedbackMutation = useMutation({
        mutationFn: () =>
            apiClient<{ success: boolean }>("/feedbacks", {
                method: "POST",
                body: { feedback: feedback.trim() },
            }),
        onSuccess: () => {
            setFeedback("");
            setError(null);
            setMessage("Feedback enviado com sucesso. Obrigado por contribuir.");
        },
        onError: (mutationError) => {
            setMessage(null);
            setError(mutationError instanceof Error ? mutationError.message : "Falha ao enviar feedback.");
        },
    });

    const handleSubmit = (event: { preventDefault: () => void }) => {
        event.preventDefault();

        if (!feedback.trim()) {
            setError("Escreva seu feedback antes de enviar.");
            setMessage(null);
            return;
        }

        if (!isAuthenticated) {
            router.push(`/auth/signin?redirect=${encodeURIComponent("/feedback")}`);
            return;
        }

        setError(null);
        setMessage(null);
        sendFeedbackMutation.mutate();
    };

    return (
        <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900">
            <div className="mx-auto w-full max-w-2xl space-y-6">
                <header className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <h1 className="text-2xl font-semibold tracking-tight">Enviar feedback</h1>
                    <p className="mt-2 text-sm text-zinc-600">
                        Relate problemas, envie sugestoes e ajude a evoluir a plataforma.
                    </p>
                </header>

                <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <label htmlFor="feedback" className="block text-sm font-medium text-zinc-700">
                            Seu feedback
                        </label>
                        <textarea
                            id="feedback"
                            value={feedback}
                            onChange={(event) => setFeedback(event.target.value)}
                            rows={8}
                            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-zinc-900/10 focus:ring"
                            placeholder="Descreva sua sugestao, bug ou melhoria..."
                        />

                        {error ? (
                            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
                        ) : null}

                        {message ? (
                            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                                {message}
                            </p>
                        ) : null}

                        <button
                            type="submit"
                            disabled={sendFeedbackMutation.isPending}
                            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {sendFeedbackMutation.isPending ? "Enviando..." : "Enviar feedback"}
                        </button>
                    </form>
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
