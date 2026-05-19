"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Home, Plus, RefreshCw, Shield } from "lucide-react";
import { Header } from "@/components/layout/header";
import { GlowCard } from "@/components/ui/spotlight-card";
import { apiClient } from "@/lib/api-client";

type CreateExercisePayload = {
    id: string;
    title: string;
    description: string;
    difficulty: "iniciante" | "intermediario" | "avancado";
    category: "html" | "css" | "javascript";
    points: number;
    instructions: string;
    order?: number;
    initialCode?: { html: string; css: string; javascript: string };
    starterTemplate?: { html: string; css: string; javascript: string };
    solutionCode?: { html: string; css: string; javascript: string };
    hints?: string[];
    validationRules?: Array<{ type: string; rule: string; message: string }>;
    tests?: string[];
};

const examplePayload: CreateExercisePayload = {
    id: "html-introducao-tags",
    title: "HTML: Introducao de Tags",
    description: "Crie um titulo e um paragrafo usando tags semanticas.",
    difficulty: "iniciante",
    category: "html",
    points: 10,
    instructions: "Adicione um <h1> com um titulo e um <p> com uma descricao.",
    order: 1,
    initialCode: { html: "", css: "", javascript: "" },
    starterTemplate: { html: "", css: "", javascript: "" },
    solutionCode: { html: "<h1>Titulo</h1><p>Descricao</p>", css: "", javascript: "" },
    hints: ["Use as tags <h1> e <p> para estruturar o conteudo."],
    validationRules: [
        {
            type: "contains",
            rule: "<h1>",
            message: "Seu codigo deve conter um titulo h1.",
        },
    ],
    tests: ["Deve conter tag h1", "Deve conter tag p"],
};

export default function AdminAddExercisePage() {
    const [jsonInput, setJsonInput] = useState(JSON.stringify(examplePayload, null, 2));
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const createExerciseMutation = useMutation({
        mutationFn: (payload: CreateExercisePayload) =>
            apiClient<{ message: string; exercise: { id: string } }>("/admin/exercises", {
                method: "POST",
                body: payload,
            }),
        onSuccess: (result) => {
            setError(null);
            setMessage(`Exercicio criado com sucesso: ${result.exercise.id}`);
        },
        onError: (mutationError) => {
            setMessage(null);
            setError(mutationError instanceof Error ? mutationError.message : "Falha ao criar exercicio.");
        },
    });

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setMessage(null);

        let parsed: unknown;
        try {
            parsed = JSON.parse(jsonInput);
        } catch {
            setError("JSON invalido. Revise a estrutura antes de enviar.");
            return;
        }

        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
            setError("O payload deve ser um objeto JSON.");
            return;
        }

        createExerciseMutation.mutate(parsed as CreateExercisePayload);
    };

    return (
        <div className="min-h-screen bg-black">
            <Header />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center space-x-2 text-sm mb-6" style={{ color: "#fff6e9" }}>
                    <Link href="/" className="hover:text-purple-400 transition-colors flex items-center">
                        <Home className="w-4 h-4 mr-1" />
                        Inicio
                    </Link>
                    <span>/</span>
                    <Link href="/categories" className="hover:text-purple-400 transition-colors">
                        Categorias
                    </Link>
                    <span>/</span>
                    <span className="text-purple-400">Painel Admin</span>
                </div>

                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/30 mb-4">
                        <Shield className="w-4 h-4 text-red-400" />
                        <span className="text-sm font-bold text-red-300">AREA ADMINISTRATIVA</span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-bold mb-3" style={{ color: "#fff6e9" }}>
                        Adicionar Novo Exercicio
                    </h1>
                    <p className="text-lg" style={{ color: "#fff6e9", opacity: 0.8 }}>
                        Crie novas quests para os aventureiros da plataforma
                    </p>
                </div>

                <GlowCard glowColor="purple" customSize className="p-8 mb-6">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="exercise-json" className="block text-sm font-bold mb-3" style={{ color: "#fff6e9" }}>
                                Payload JSON do Exercicio
                            </label>
                            <textarea
                                id="exercise-json"
                                value={jsonInput}
                                onChange={(event) => setJsonInput(event.target.value)}
                                rows={24}
                                className="input-8bit w-full font-mono text-xs"
                            />
                        </div>

                        {error ? (
                            <div className="p-4 rounded-lg border bg-red-900/20 border-red-500/50 text-red-300 flex items-start gap-2">
                                <span className="font-bold">Erro:</span>
                                <span>{error}</span>
                            </div>
                        ) : null}

                        {message ? (
                            <div className="p-4 rounded-lg border bg-green-900/20 border-green-500/50 text-green-300 flex items-start gap-2">
                                <CheckCircle2 className="w-5 h-5 mt-0.5" />
                                <span>{message}</span>
                            </div>
                        ) : null}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button
                                type="submit"
                                disabled={createExerciseMutation.isPending}
                                className="rpg-button flex items-center justify-center"
                            >
                                {createExerciseMutation.isPending ? (
                                    <>
                                        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Criando...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Criar Exercicio
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setJsonInput(JSON.stringify(examplePayload, null, 2));
                                    setError(null);
                                    setMessage(null);
                                }}
                                className="border border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 rounded-md px-4 py-2 text-sm font-semibold transition-colors flex items-center justify-center"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Restaurar Exemplo
                            </button>

                            <Link
                                href="/"
                                className="border border-zinc-500/40 bg-zinc-700/20 hover:bg-zinc-700/35 text-zinc-200 rounded-md px-4 py-2 text-sm font-semibold transition-colors flex items-center justify-center"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Voltar ao Inicio
                            </Link>
                        </div>
                    </form>
                </GlowCard>
            </main>
        </div>
    );
}
