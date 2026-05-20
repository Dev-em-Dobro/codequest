"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Header } from "@/components/layout/header";
import { useAuth } from "@/hooks/use-auth";

type StatusState = {
    type: "success" | "error" | "info";
    message: string;
};

const exampleExercise = {
    id: "html-tags-essenciais-cabecalho",
    title: "HTML: Tags Essenciais - Cabeçalho",
    description: "Aprenda a usar a tag <h1> para criar o título principal da página.",
    difficulty: "iniciante",
    category: "html",
    points: 10,
    instructions: "Crie um elemento <h1> com o texto 'Bem-vindo à minha página!' dentro da tag <body>.",
    solutionCode: {
        html: "<h1>Bem-vindo à minha página!</h1>",
        css: "",
        javascript: "",
    },
    hints: [
        "Use a tag <h1> para criar um título principal",
        "Coloque o texto exatamente entre as tags de abertura e fechamento",
    ],
    validationRules: [
        {
            type: "contains",
            rule: "<h1>Bem-vindo à minha página!</h1>",
            message: "Seu código deve conter um título principal com o texto correto",
        },
    ],
    tests: ["Deve conter a tag <h1>", "Deve ter o texto correto dentro do cabeçalho"],
};

export default function AddExercisePage() {
    const router = useRouter();
    const { user } = useAuth();

    const [jsonInput, setJsonInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<StatusState | null>(null);

    let statusClass = "bg-blue-900/20 border-blue-500/40 text-blue-200";
    if (status?.type === "success") {
        statusClass = "bg-green-900/20 border-green-500/40 text-green-200";
    } else if (status?.type === "error") {
        statusClass = "bg-red-900/20 border-red-500/40 text-red-200";
    }

    const loadExample = () => {
        setJsonInput(JSON.stringify(exampleExercise, null, 2));
        setStatus(null);
    };

    const handleSubmit = async (event: { preventDefault: () => void }) => {
        event.preventDefault();

        const token = user?.id || globalThis.localStorage.getItem("codequest_session_id");
        if (!token) {
            setStatus({
                type: "error",
                message: "Você precisa estar logado para criar exercícios.",
            });

            globalThis.setTimeout(() => {
                router.push("/auth/signin");
            }, 2000);
            return;
        }

        setLoading(true);
        setStatus(null);

        try {
            const response = await fetch("/api/admin/exercises", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: jsonInput,
            });

            const result = (await response.json()) as { error?: string };

            if (!response.ok) {
                throw new Error(result.error || "Erro ao criar exercício");
            }

            setStatus({
                type: "success",
                message: "Exercício criado com sucesso! Redirecionando para a página inicial...",
            });
            setJsonInput("");

            globalThis.setTimeout(() => {
                router.push("/");
            }, 2000);
        } catch (submitError) {
            const message = submitError instanceof Error ? submitError.message : "Erro ao criar exercício.";
            setStatus({ type: "error", message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black">
            <Header />

            <main className="max-w-4xl mx-auto p-4 mt-8">
                <h1 className="text-3xl font-bold mb-8" style={{ color: "#fff6e9", fontFamily: "var(--font-retro)" }}>
                    Adicionar Novo Exercício
                </h1>

                <div className="rounded-xl border border-purple-500/30 bg-black/40 p-6 mb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                        <h2 className="text-xl font-semibold" style={{ color: "#fff6e9" }}>
                            JSON do Exercício
                        </h2>

                        <button type="button" onClick={loadExample} className="rpg-button px-4 py-2 text-sm">
                            Carregar Exemplo
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <textarea
                            value={jsonInput}
                            onChange={(event) => setJsonInput(event.target.value)}
                            placeholder="Cole aqui o JSON do exercício..."
                            className="w-full h-96 p-4 bg-gray-900 text-white font-mono text-sm rounded-lg border border-gray-700 focus:border-purple-400 focus:outline-none"
                            required
                        />

                        {status ? (
                            <div className={`mt-4 rounded-lg border px-4 py-3 text-sm ${statusClass}`}>
                                {status.message}
                            </div>
                        ) : null}

                        <div className="mt-6 flex flex-wrap gap-4">
                            <button type="submit" disabled={loading || !jsonInput} className="rpg-button px-5 py-2 disabled:opacity-50">
                                {loading ? "Criando..." : "Criar Exercício"}
                            </button>

                            <Link
                                href="/"
                                className="rounded-md border border-zinc-600 bg-zinc-800/60 hover:bg-zinc-700/80 text-zinc-100 px-5 py-2 text-sm font-semibold transition-colors"
                            >
                                Cancelar
                            </Link>
                        </div>
                    </form>
                </div>

                <div className="rounded-xl border border-purple-500/20 bg-black/30 p-6">
                    <h3 className="text-lg font-semibold mb-4" style={{ color: "#fff6e9" }}>
                        Estrutura do JSON
                    </h3>
                    <ul className="space-y-2 text-sm" style={{ color: "#d7d1f1" }}>
                        <li>• id: Identificador único do exercício</li>
                        <li>• title: Título do exercício</li>
                        <li>• description: Descrição do exercício</li>
                        <li>• difficulty: iniciante | intermediario | avancado</li>
                        <li>• category: html | css | javascript</li>
                        <li>• points: Pontos do exercício</li>
                        <li>• instructions: Instruções detalhadas</li>
                        <li>• solutionCode: Objeto com html, css e javascript</li>
                        <li>• hints: Array de dicas</li>
                        <li>• validationRules: Array de regras de validação</li>
                        <li>• tests: Array de descrições de testes</li>
                    </ul>
                </div>
            </main>
        </div>
    );
}
