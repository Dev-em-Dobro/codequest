"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, CheckCircle, Home, MessageSquare, Send } from "lucide-react";
import { Header } from "@/components/layout/header";
import { GlowCard } from "@/components/ui/spotlight-card";
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

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
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
        <div className="min-h-screen bg-black">
            <Header />

            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <div className="flex items-center space-x-2 text-sm mb-4" style={{ color: "#fff6e9" }}>
                        <Link href="/" className="hover:text-purple-400 transition-colors">
                            <Home className="w-4 h-4 inline mr-1" />
                            Inicio
                        </Link>
                        <span>/</span>
                        <span className="text-purple-400">Feedback</span>
                    </div>

                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold mb-4" style={{ color: "#fff6e9" }}>
                            Mural da Guilda
                        </h1>
                        <p className="text-lg" style={{ color: "#fff6e9", opacity: 0.8 }}>
                            Compartilhe suas sugestoes e nos ajude a evoluir o reino
                        </p>
                    </div>
                </div>

                <GlowCard glowColor="purple" customSize className="p-8 mb-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="feedback" className="text-lg font-medium mb-3 block" style={{ color: "#fff6e9" }}>
                                Sua Mensagem
                            </label>
                            <textarea
                                id="feedback"
                                value={feedback}
                                onChange={(event) => setFeedback(event.target.value)}
                                placeholder="Descreva suas ideias, reportes bugs ou sugira melhorias..."
                                className="input-8bit w-full min-h-[180px] resize-none"
                                disabled={sendFeedbackMutation.isPending}
                            />
                            <p className="text-sm mt-2" style={{ color: "#fff6e9", opacity: 0.6 }}>
                                Minimo de 10 caracteres para um feedback mais detalhado
                            </p>
                        </div>

                        {error ? (
                            <div className="p-4 border rounded-lg flex items-center space-x-2 bg-red-900/20 border-red-500 text-red-300">
                                <AlertCircle className="w-5 h-5" />
                                <span>{error}</span>
                            </div>
                        ) : null}

                        {message ? (
                            <div className="p-4 border rounded-lg flex items-center space-x-2 bg-green-900/20 border-green-500 text-green-300">
                                <CheckCircle className="w-5 h-5" />
                                <span>{message}</span>
                            </div>
                        ) : null}

                        <button
                            type="submit"
                            disabled={sendFeedbackMutation.isPending || feedback.trim().length < 10}
                            className="w-full rpg-button flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {sendFeedbackMutation.isPending ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Enviando para o Conselho...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    Enviar Feedback
                                </>
                            )}
                        </button>
                    </form>
                </GlowCard>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <GlowCard glowColor="blue" customSize className="p-4 text-center">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                        <h3 className="font-bold mb-1" style={{ color: "#fff6e9" }}>
                            Sugestoes
                        </h3>
                        <p className="text-sm" style={{ color: "#fff6e9", opacity: 0.7 }}>
                            Novas funcionalidades e melhorias
                        </p>
                    </GlowCard>

                    <GlowCard glowColor="green" customSize className="p-4 text-center">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
                        <h3 className="font-bold mb-1" style={{ color: "#fff6e9" }}>
                            Reporte Bugs
                        </h3>
                        <p className="text-sm" style={{ color: "#fff6e9", opacity: 0.7 }}>
                            Problemas tecnicos encontrados
                        </p>
                    </GlowCard>

                    <GlowCard glowColor="orange" customSize className="p-4 text-center">
                        <CheckCircle className="w-8 h-8 mx-auto mb-2 text-orange-400" />
                        <h3 className="font-bold mb-1" style={{ color: "#fff6e9" }}>
                            Elogios
                        </h3>
                        <p className="text-sm" style={{ color: "#fff6e9", opacity: 0.7 }}>
                            Compartilhe sua experiencia positiva
                        </p>
                    </GlowCard>
                </div>
            </main>
        </div>
    );
}
