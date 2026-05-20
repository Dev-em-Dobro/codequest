"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ChevronRight, MessageSquare, Send } from "lucide-react";
import { Header } from "@/components/layout/header";
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
            setMessage("Feedback enviado! Obrigado por ajudar a melhorar o CodeQuest!");
        },
        onError: (mutationError) => {
            setMessage(null);
            setError(mutationError instanceof Error ? mutationError.message : "Ocorreu um erro ao enviar seu feedback. Tente novamente.");
        },
    });

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!feedback.trim()) {
            setError("Por favor, escreva seu feedback antes de enviar.");
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

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <nav className="mb-6" aria-label="Breadcrumb">
                    <ol className="flex items-center space-x-2 text-sm">
                        <li>
                            <Link href="/" className="flex items-center text-slate-400 hover:text-purple-400 transition-colors">
                                Início
                            </Link>
                        </li>
                        <ChevronRight className="w-4 h-4 text-slate-600" />
                        <li>
                            <span className="text-purple-400 font-medium">Enviar Feedback</span>
                        </li>
                    </ol>
                </nav>

                <div className="text-center mb-12">
                    <div className="flex items-center justify-center mb-4">
                        <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(157, 78, 221, 0.1)" }}>
                            <MessageSquare className="w-10 h-10" style={{ color: "#9d4edd" }} />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold mb-4" style={{ color: "#9d4edd" }}>
                        Enviar Feedback
                    </h1>
                    <p
                        style={{
                            color: "white",
                            fontFamily: "Inter,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif",
                            fontSize: "1.2rem",
                            lineHeight: "1.75rem",
                            fontWeight: "300",
                            maxWidth: "600px",
                            margin: "0 auto",
                        }}
                    >
                        Sua opinião é fundamental para melhorarmos a plataforma
                    </p>
                </div>

                <div className="max-w-2xl mx-auto">
                    <div className="rounded-2xl border border-zinc-700 bg-[#121317] p-6">
                        <div className="mb-4">
                            <div
                                style={{
                                    color: "#fff6e9",
                                    fontFamily: "Inter,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif",
                                }}
                                className="text-[2rem] font-bold leading-tight"
                            >
                                Como podemos melhorar?
                            </div>
                            <p style={{ color: "#fff6e9", opacity: 0.8, fontSize: "1rem", marginTop: "0.5rem" }}>
                                Se você encontrou algum problema ou tem algum feedback pra melhorar a plataforma, envie abaixo por favor. Vai nos ajudar muito a melhorar o CodeQuest pra você!
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <textarea
                                    value={feedback}
                                    onChange={(event) => setFeedback(event.target.value)}
                                    placeholder="Escreva seu feedback aqui... Pode ser uma sugestão, crítica, elogio ou relato de bug."
                                    className="min-h-[250px] w-full resize-none rounded-md border border-purple-500/20 bg-gray-700/50 p-3 text-white placeholder:text-slate-400 focus:border-purple-500"
                                    disabled={sendFeedbackMutation.isPending}
                                    style={{ fontSize: "1rem" }}
                                />
                                <p className="text-sm mt-2" style={{ color: "#fff6e9", opacity: 0.6 }}>
                                    Seu feedback será analisado pela nossa equipe
                                </p>
                            </div>

                            {error ? (
                                <div className="rounded-md border border-red-500/45 bg-red-900/30 p-3 text-sm text-red-200">{error}</div>
                            ) : null}

                            {message ? (
                                <div className="rounded-md border border-green-500/45 bg-green-900/30 p-3 text-sm text-green-200">{message}</div>
                            ) : null}

                            <button type="submit" className="w-full rpg-button" disabled={sendFeedbackMutation.isPending || !feedback.trim()}>
                                {sendFeedbackMutation.isPending ? (
                                    <>
                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                                        Enviando...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-5 w-5" />
                                        Enviar Feedback
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="rounded-lg border border-purple-500/20 p-4" style={{ backgroundColor: "rgba(157, 78, 221, 0.05)" }}>
                            <h3 className="mb-2 font-semibold" style={{ color: "#9d4edd" }}>
                                🐛 Bugs
                            </h3>
                            <p className="text-sm" style={{ color: "#fff6e9", opacity: 0.8 }}>
                                Encontrou algum erro? Descreva o problema detalhadamente
                            </p>
                        </div>

                        <div className="rounded-lg border border-purple-500/20 p-4" style={{ backgroundColor: "rgba(157, 78, 221, 0.05)" }}>
                            <h3 className="mb-2 font-semibold" style={{ color: "#9d4edd" }}>
                                💡 Sugestões
                            </h3>
                            <p className="text-sm" style={{ color: "#fff6e9", opacity: 0.8 }}>
                                Tem ideias para novos recursos ou melhorias?
                            </p>
                        </div>

                        <div className="rounded-lg border border-purple-500/20 p-4" style={{ backgroundColor: "rgba(157, 78, 221, 0.05)" }}>
                            <h3 className="mb-2 font-semibold" style={{ color: "#9d4edd" }}>
                                ⭐ Elogios
                            </h3>
                            <p className="text-sm" style={{ color: "#fff6e9", opacity: 0.8 }}>
                                Gostou de algo? Nos conte o que está funcionando bem!
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
