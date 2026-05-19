"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckCircle2, Code2, Home, Lightbulb, Play, RotateCcw, Send } from "lucide-react";
import { Header } from "@/components/layout/header";
import { GlowCard } from "@/components/ui/spotlight-card";

export default function SimpleExercisePage() {
    const sampleExercise = {
        id: "intro-html-css-js",
        title: "Primeira Quest: Seu Cartao de Aventureiro",
        description: "Crie um cartao de apresentacao com nome, classe e um botao interativo.",
        instructions:
            "Adicione um titulo h1 com seu nome, um paragrafo com sua classe e um botao que muda o texto ao ser clicado.",
        hints: [
            "Use uma estrutura com div principal para o cartao.",
            "Crie um botao com id para manipular com JavaScript.",
            "No JS, use addEventListener para alterar o conteudo do botao.",
        ],
        expectedChecks: ["<h1", "<p", "<button", "addEventListener"],
        starterTemplate: {
            html: "<div class='card'>\n  <h1>Seu Nome</h1>\n  <p>Classe: Desenvolvedor</p>\n  <button id='magic-btn'>Ativar Magia</button>\n</div>",
            css: ".card {\n  background: rgba(0,0,0,0.4);\n  border: 2px solid #9d4edd;\n  border-radius: 12px;\n  padding: 24px;\n  color: #fff6e9;\n  max-width: 320px;\n  margin: 40px auto;\n}\n\nbutton {\n  margin-top: 12px;\n  background: #9d4edd;\n  color: #fff;\n  border: none;\n  border-radius: 8px;\n  padding: 10px 14px;\n  cursor: pointer;\n}",
            javascript:
                "const button = document.getElementById('magic-btn');\nbutton?.addEventListener('click', () => {\n  button.textContent = 'Magia Ativada!';\n});",
        },
    };

    const [htmlCode, setHtmlCode] = useState(sampleExercise.starterTemplate.html);
    const [cssCode, setCssCode] = useState(sampleExercise.starterTemplate.css);
    const [jsCode, setJsCode] = useState(sampleExercise.starterTemplate.javascript);
    const [activeTab, setActiveTab] = useState<"html" | "css" | "javascript">("html");
    const [currentHint, setCurrentHint] = useState(-1);
    const [resultMessage, setResultMessage] = useState<string | null>(null);
    const [resultType, setResultType] = useState<"success" | "error" | null>(null);

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
                        ${cssCode}
                    </style>
                </head>
                <body>
                    ${htmlCode}
                    <script>
                        try {
                            ${jsCode}
                        } catch (error) {
                            console.error(error);
                        }
                    </script>
                </body>
            </html>
        `;
    }, [cssCode, htmlCode, jsCode]);

    const showHint = () => {
        setCurrentHint((hintIndex) => Math.min(hintIndex + 1, sampleExercise.hints.length - 1));
    };

    const resetCode = () => {
        setHtmlCode(sampleExercise.starterTemplate.html);
        setCssCode(sampleExercise.starterTemplate.css);
        setJsCode(sampleExercise.starterTemplate.javascript);
        setResultMessage(null);
        setResultType(null);
    };

    const runCode = () => {
        setResultMessage("Preview atualizado com sucesso.");
        setResultType("success");
    };

    const submitSolution = () => {
        const combinedCode = `${htmlCode} ${jsCode}`.toLowerCase();
        const allChecksPassed = sampleExercise.expectedChecks.every((check) => combinedCode.includes(check.toLowerCase()));

        if (allChecksPassed) {
            setResultMessage("Excelente! Voce completou a quest com sucesso!");
            setResultType("success");
            return;
        }

        setResultMessage("Sua solucao ainda nao atende todos os requisitos. Use as dicas e tente novamente.");
        setResultType("error");
    };

    return (
        <div className="min-h-screen bg-black">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center space-x-2 text-sm mb-6" style={{ color: "#fff6e9" }}>
                    <Link href="/" className="hover:text-purple-400 transition-colors flex items-center">
                        <Home className="w-4 h-4 mr-1" />
                        Inicio
                    </Link>
                    <span>/</span>
                    <span className="text-purple-400">Quest Simples</span>
                </div>

                <GlowCard glowColor="purple" customSize className="p-6 mb-8">
                    <h1 className="text-2xl lg:text-3xl font-bold text-white mb-3">{sampleExercise.title}</h1>
                    <p className="text-sm text-slate-300 mb-4">{sampleExercise.description}</p>
                    <div className="rounded-lg border border-purple-500/30 bg-black/30 p-4 text-sm text-slate-200">
                        <strong>Objetivo:</strong> {sampleExercise.instructions}
                    </div>
                </GlowCard>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
                    <GlowCard glowColor="blue" customSize className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Code2 className="w-5 h-5 text-blue-400" />
                            <h2 className="text-lg font-bold text-white">Editor de Codigo</h2>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                            {[
                                { key: "html", label: "HTML" },
                                { key: "css", label: "CSS" },
                                { key: "javascript", label: "JavaScript" },
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setActiveTab(tab.key as "html" | "css" | "javascript")}
                                    className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors ${activeTab === tab.key
                                            ? "bg-purple-500 text-white border border-purple-500"
                                            : "bg-zinc-800 text-zinc-200 border border-zinc-700"
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="mb-4">
                            {activeTab === "html" ? (
                                <textarea
                                    value={htmlCode}
                                    onChange={(event) => setHtmlCode(event.target.value)}
                                    className="input-8bit w-full h-64 font-mono text-xs resize-none"
                                />
                            ) : null}

                            {activeTab === "css" ? (
                                <textarea
                                    value={cssCode}
                                    onChange={(event) => setCssCode(event.target.value)}
                                    className="input-8bit w-full h-64 font-mono text-xs resize-none"
                                />
                            ) : null}

                            {activeTab === "javascript" ? (
                                <textarea
                                    value={jsCode}
                                    onChange={(event) => setJsCode(event.target.value)}
                                    className="input-8bit w-full h-64 font-mono text-xs resize-none"
                                />
                            ) : null}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <button type="button" onClick={showHint} className="rpg-button text-sm" disabled={currentHint >= sampleExercise.hints.length - 1}>
                                <Lightbulb className="w-4 h-4 inline mr-1" />
                                Dica
                            </button>
                            <button type="button" onClick={resetCode} className="rpg-button text-sm">
                                <RotateCcw className="w-4 h-4 inline mr-1" />
                                Reset
                            </button>
                            <button type="button" onClick={runCode} className="rpg-button text-sm">
                                <Play className="w-4 h-4 inline mr-1" />
                                Rodar
                            </button>
                            <button type="button" onClick={submitSolution} className="rpg-button text-sm">
                                <Send className="w-4 h-4 inline mr-1" />
                                Enviar
                            </button>
                        </div>

                        {currentHint >= 0 ? (
                            <div className="mt-4 rounded-lg border border-yellow-500/30 bg-yellow-900/20 p-3 text-sm text-yellow-200">
                                <strong>Dica {currentHint + 1}:</strong> {sampleExercise.hints[currentHint]}
                            </div>
                        ) : null}

                        {resultMessage ? (
                            <div
                                className={`mt-4 rounded-lg border p-3 text-sm ${resultType === "success"
                                        ? "bg-green-900/20 border-green-500/30 text-green-300"
                                        : "bg-red-900/20 border-red-500/30 text-red-300"
                                    }`}
                            >
                                {resultType === "success" ? <CheckCircle2 className="w-4 h-4 inline mr-1" /> : null}
                                {resultMessage}
                            </div>
                        ) : null}
                    </GlowCard>

                    <GlowCard glowColor="green" customSize className="p-6">
                        <h2 className="text-lg font-bold text-white mb-4">Preview ao Vivo</h2>
                        <div className="rounded-lg border border-green-500/30 overflow-hidden bg-black min-h-[420px]">
                            <iframe
                                title="Preview do exercicio"
                                srcDoc={previewDocument}
                                sandbox="allow-scripts"
                                className="w-full h-[420px] bg-white"
                            />
                        </div>
                    </GlowCard>
                </div>
            </main>
        </div>
    );
}
