"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
    ArrowLeft,
    CheckCircle2,
    ChevronRight,
    Code,
    Gem,
    Home,
    Lightbulb,
    Play,
    RotateCcw,
    Trophy,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { GlowCard } from "@/components/ui/spotlight-card";

type CodeTab = "html" | "css" | "javascript";

type FeedbackState = {
    type: "success" | "error";
    message: string;
};

const sampleExercise = {
    id: "html-1",
    title: "HTML: Minha Primeira Página",
    description: "Crie sua primeira página web usando HTML básico",
    category: "HTML",
    difficulty: "Iniciante",
    points: 10,
    instructions: `
      <h3>🎯 Objetivo:</h3>
      <p>Crie uma página HTML básica com as seguintes características:</p>
      <ul>
        <li>Um título principal (h1) com seu nome</li>
        <li>Um parágrafo de apresentação</li>
        <li>Uma lista com seus hobbies favoritos</li>
      </ul>

      <h3>📝 Estrutura esperada:</h3>
      <ol>
        <li>Use a tag &lt;h1&gt; para o título</li>
        <li>Use a tag &lt;p&gt; para o parágrafo</li>
        <li>Use &lt;ul&gt; e &lt;li&gt; para a lista</li>
      </ol>
    `,
    hints: [
        "Comece com a estrutura básica: <h1>, <p>, <ul>",
        "Lembre-se de fechar todas as tags",
        "Use <li> dentro de <ul> para cada item da lista",
    ],
    initialCode: {
        html: "",
        css: "",
        javascript: "",
    },
    starterTemplate: {
        html: `<!DOCTYPE html>
<html>
<head>
  <title>Minha Primeira Página</title>
</head>
<body>
  <!-- Escreva seu código HTML aqui -->

</body>
</html>`,
        css: "/* Adicione estilos CSS aqui se necessário */",
        javascript: "// Adicione JavaScript aqui se necessário",
    },
};

function validateSolution(htmlCode: string): boolean {
    const normalized = htmlCode.toLowerCase();
    const hasH1 = normalized.includes("<h1");
    const hasP = normalized.includes("<p");
    const hasUl = normalized.includes("<ul");
    const hasLi = normalized.includes("<li");

    return hasH1 && hasP && hasUl && hasLi;
}

export default function SimpleExercisePage() {
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<CodeTab>("html");
    const [htmlCode, setHtmlCode] = useState(sampleExercise.initialCode.html);
    const [cssCode, setCssCode] = useState(sampleExercise.initialCode.css);
    const [jsCode, setJsCode] = useState(sampleExercise.initialCode.javascript);
    const [currentHint, setCurrentHint] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const [previewKey, setPreviewKey] = useState(0);
    const [feedback, setFeedback] = useState<FeedbackState | null>(null);

    const previewDocument = useMemo(() => {
        return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Preview</title>
        <style>
          body { margin: 0; padding: 20px; font-family: system-ui, sans-serif; }
          ${cssCode}
        </style>
      </head>
      <body>
        ${htmlCode}
        <script>
          try {
            ${jsCode}
          } catch (error) {
            console.error('JavaScript Error:', error);
            document.body.innerHTML += '<div style="color: red; background: #fee; padding: 10px; border: 1px solid red; margin: 10px 0;">Erro no JavaScript: ' + error.message + '</div>';
          }
        </script>
      </body>
      </html>
    `;
    }, [cssCode, htmlCode, jsCode]);

    const runCode = () => {
        setPreviewKey((value) => value + 1);
        setFeedback({ type: "success", message: "Preview atualizado com sucesso." });
    };

    const resetCode = () => {
        setHtmlCode(sampleExercise.initialCode.html);
        setCssCode(sampleExercise.initialCode.css);
        setJsCode(sampleExercise.initialCode.javascript);
        setCurrentHint(0);
        setIsCompleted(false);
        setPreviewKey((value) => value + 1);
        setFeedback({ type: "success", message: "O código foi resetado para o estado inicial." });
    };

    const loadTemplate = () => {
        setHtmlCode(sampleExercise.starterTemplate.html);
        setCssCode(sampleExercise.starterTemplate.css);
        setJsCode(sampleExercise.starterTemplate.javascript);
        setPreviewKey((value) => value + 1);
        setFeedback({ type: "success", message: "Template inicial carregado." });
    };

    const showHint = () => {
        if (currentHint < sampleExercise.hints.length) {
            setCurrentHint((value) => value + 1);
        }
    };

    const submitSolution = () => {
        if (validateSolution(htmlCode)) {
            setIsCompleted(true);
            setFeedback({
                type: "success",
                message: `Parabéns! Você completou o exercício e ganhou ${sampleExercise.points} pontos.`,
            });
            return;
        }

        setFeedback({
            type: "error",
            message: "Sua solução ainda não atende aos requisitos. Verifique as instruções.",
        });
    };

    return (
        <div className="min-h-screen bg-black">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <nav className="mb-6" aria-label="Breadcrumb">
                    <ol className="flex items-center space-x-2 text-sm">
                        <li>
                            <Link href="/" className="flex items-center text-slate-400 hover:text-purple-400 transition-colors">
                                <Home className="w-4 h-4 mr-1" />
                                Início
                            </Link>
                        </li>
                        <ChevronRight className="w-4 h-4 text-slate-600" />
                        <li>
                            <span className="text-purple-400 font-medium">{sampleExercise.title}</span>
                        </li>
                    </ol>
                </nav>

                <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="flex items-start gap-4">
                        <button type="button" onClick={() => router.back()} className="rpg-button px-4 py-2 mt-1">
                            <ArrowLeft className="w-4 h-4 mr-2 inline" />
                            Voltar
                        </button>

                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <h1 className="text-2xl font-bold" style={{ color: "#fff6e9", fontFamily: "var(--font-retro)" }}>
                                    {sampleExercise.title}
                                </h1>
                                {isCompleted ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-green-500/40 bg-green-500/20 text-green-200 text-xs font-semibold">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Concluído
                                    </span>
                                ) : null}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-sm">
                                <span className="px-2 py-1 rounded-md bg-green-500/20 border border-green-500/30 text-green-200">
                                    {sampleExercise.difficulty}
                                </span>
                                <span className="px-2 py-1 rounded-md border border-purple-500/30 text-purple-200 inline-flex items-center gap-1 number">
                                    <Gem className="w-3 h-3" />
                                    {sampleExercise.points} pontos
                                </span>
                                <span className="px-2 py-1 rounded-md border border-zinc-600 text-zinc-300">
                                    {sampleExercise.category}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        <button
                            type="button"
                            onClick={showHint}
                            disabled={currentHint >= sampleExercise.hints.length}
                            className="rpg-button px-3 py-2 text-sm disabled:opacity-50"
                        >
                            <Lightbulb className="w-4 h-4 inline mr-1" />
                            Dica
                        </button>

                        <button type="button" onClick={loadTemplate} className="rpg-button px-3 py-2 text-sm">
                            <Code className="w-4 h-4 inline mr-1" />
                            Template
                        </button>

                        <button type="button" onClick={resetCode} className="rpg-button px-3 py-2 text-sm">
                            <RotateCcw className="w-4 h-4 inline mr-1" />
                            Resetar
                        </button>

                        <button type="button" onClick={runCode} className="rpg-button px-3 py-2 text-sm">
                            <Play className="w-4 h-4 inline mr-1" />
                            Executar
                        </button>

                        <button type="button" onClick={submitSolution} className="rpg-button px-3 py-2 text-sm">
                            <Trophy className="w-4 h-4 inline mr-1" />
                            Enviar
                        </button>
                    </div>
                </div>

                {feedback ? (
                    <div
                        className={`mb-6 rounded-lg border px-4 py-3 text-sm ${feedback.type === "success"
                            ? "bg-green-900/20 border-green-500/40 text-green-200"
                            : "bg-red-900/20 border-red-500/40 text-red-200"
                            }`}
                    >
                        {feedback.message}
                    </div>
                ) : null}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <GlowCard glowColor="purple" customSize className="h-full">
                        <div className="p-6 space-y-4">
                            <h2 className="text-lg" style={{ color: "#fff6e9", fontFamily: "var(--font-retro)" }}>
                                📋 Instruções
                            </h2>
                            <p style={{ color: "#fff6e9", opacity: 0.85 }}>{sampleExercise.description}</p>

                            <div className="prose prose-sm max-w-none text-zinc-200">
                                <div dangerouslySetInnerHTML={{ __html: sampleExercise.instructions }} />
                            </div>

                            {currentHint > 0 ? (
                                <div className="rounded-lg border border-yellow-500/40 bg-yellow-900/20 p-3">
                                    <p className="text-sm font-semibold text-yellow-200 mb-2">Dicas usadas:</p>
                                    <ul className="space-y-1 text-sm text-yellow-100">
                                        {sampleExercise.hints.slice(0, currentHint).map((hint) => (
                                            <li key={hint}>• {hint}</li>
                                        ))}
                                    </ul>
                                </div>
                            ) : null}
                        </div>
                    </GlowCard>

                    <GlowCard glowColor="purple" customSize className="h-full">
                        <div className="p-6 h-full flex flex-col">
                            <h2 className="text-lg flex items-center mb-4" style={{ color: "#fff6e9", fontFamily: "var(--font-retro)" }}>
                                <Code className="w-5 h-5 mr-2" />
                                Editor de Código
                            </h2>

                            <div className="grid grid-cols-3 gap-2 mb-4">
                                {(["html", "css", "javascript"] as const).map((tab) => (
                                    <button
                                        key={tab}
                                        type="button"
                                        onClick={() => setActiveTab(tab)}
                                        className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors ${activeTab === tab
                                            ? "bg-purple-500 text-white border border-purple-500"
                                            : "bg-zinc-800 text-zinc-200 border border-zinc-700"
                                            }`}
                                    >
                                        {tab === "javascript" ? "JavaScript" : tab.toUpperCase()}
                                    </button>
                                ))}
                            </div>

                            <div className="flex-1">
                                {activeTab === "html" ? (
                                    <textarea
                                        value={htmlCode}
                                        onChange={(event) => setHtmlCode(event.target.value)}
                                        className="input-8bit w-full h-full text-sm resize-none"
                                        spellCheck={false}
                                        style={{ minHeight: 420, fontFamily: "var(--font-retro)", fontSize: 12 }}
                                    />
                                ) : null}

                                {activeTab === "css" ? (
                                    <textarea
                                        value={cssCode}
                                        onChange={(event) => setCssCode(event.target.value)}
                                        className="input-8bit w-full h-full text-sm resize-none"
                                        spellCheck={false}
                                        style={{ minHeight: 420, fontFamily: "var(--font-retro)", fontSize: 12 }}
                                    />
                                ) : null}

                                {activeTab === "javascript" ? (
                                    <textarea
                                        value={jsCode}
                                        onChange={(event) => setJsCode(event.target.value)}
                                        className="input-8bit w-full h-full text-sm resize-none"
                                        spellCheck={false}
                                        style={{ minHeight: 420, fontFamily: "var(--font-retro)", fontSize: 12 }}
                                    />
                                ) : null}
                            </div>
                        </div>
                    </GlowCard>

                    <GlowCard glowColor="green" customSize className="h-full">
                        <div className="p-6 h-full flex flex-col">
                            <h2 className="text-lg mb-4" style={{ color: "#fff6e9", fontFamily: "var(--font-retro)" }}>
                                👁️ Preview
                            </h2>

                            <div className="rounded-lg border border-green-500/30 overflow-hidden bg-white flex-1 min-h-[420px]">
                                <iframe
                                    key={previewKey}
                                    title="Preview do exercício"
                                    srcDoc={previewDocument}
                                    sandbox="allow-scripts"
                                    className="w-full h-full"
                                />
                            </div>
                        </div>
                    </GlowCard>
                </div>
            </main>
        </div>
    );
}
