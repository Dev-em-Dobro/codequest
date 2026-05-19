"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
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

    const handleSubmit = (event: { preventDefault: () => void }) => {
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
        <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900">
            <div className="mx-auto w-full max-w-4xl space-y-6">
                <header className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <h1 className="text-2xl font-semibold tracking-tight">Admin: adicionar exercicio</h1>
                    <p className="mt-2 text-sm text-zinc-600">
                        Cole ou edite um JSON de exercicio e envie para a API administrativa.
                    </p>
                </header>

                <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <label htmlFor="exercise-json" className="block text-sm font-medium text-zinc-700">
                            Payload JSON
                        </label>
                        <textarea
                            id="exercise-json"
                            value={jsonInput}
                            onChange={(event) => setJsonInput(event.target.value)}
                            rows={22}
                            className="w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-xs outline-none ring-zinc-900/10 focus:ring"
                        />

                        {error ? (
                            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
                        ) : null}

                        {message ? (
                            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                                {message}
                            </p>
                        ) : null}

                        <div className="flex flex-wrap gap-3">
                            <button
                                type="submit"
                                disabled={createExerciseMutation.isPending}
                                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {createExerciseMutation.isPending ? "Criando..." : "Criar exercicio"}
                            </button>

                            <button
                                type="button"
                                onClick={() => setJsonInput(JSON.stringify(examplePayload, null, 2))}
                                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
                            >
                                Restaurar exemplo
                            </button>
                        </div>
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
