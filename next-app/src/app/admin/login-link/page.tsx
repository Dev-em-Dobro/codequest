"use client";

import { useState, type FormEvent } from "react";
import { Check, Copy, Link2, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/header";
import { FormFeedback } from "@/components/auth/form-feedback";
import { getStoredSessionToken } from "@/lib/auth-client";

type GeneratedLink = {
    url: string;
    expiresAt: string;
    student: { name: string; email: string };
};

function formatExpiry(iso: string): string {
    return new Date(iso).toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    });
}

export default function AdminLoginLinkPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generated, setGenerated] = useState<GeneratedLink | null>(null);
    const [copied, setCopied] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setGenerated(null);
        setCopied(false);
        setLoading(true);

        try {
            const sessionToken = getStoredSessionToken();
            const response = await fetch("/api/admin/login-links", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
                },
                credentials: "include",
                body: JSON.stringify({ email }),
            });

            const payload = (await response.json().catch(() => ({}))) as Partial<GeneratedLink> & {
                error?: string;
                message?: string;
            };

            if (!response.ok || !payload.url || !payload.expiresAt || !payload.student) {
                setError(payload.error || payload.message || "Não foi possível gerar o link.");
                return;
            }

            setGenerated({ url: payload.url, expiresAt: payload.expiresAt, student: payload.student });
        } catch {
            setError("Não foi possível gerar o link agora. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        if (!generated) {
            return;
        }

        try {
            await navigator.clipboard.writeText(generated.url);
            setCopied(true);
        } catch {
            setError("Não deu para copiar automaticamente. Selecione o link e copie manualmente.");
        }
    };

    return (
        <div className="min-h-screen bg-black">
            <Header />

            <main className="mx-auto mt-8 max-w-3xl p-4">
                <h1 className="mb-2 text-3xl font-bold" style={{ color: "#fff6e9", fontFamily: "var(--font-retro)" }}>
                    Link de acesso do aluno
                </h1>
                <p className="mb-8" style={{ color: "#fff6e9", opacity: 0.8 }}>
                    Gera um link que entra direto na conta do aluno, sem senha. Vale por 24 horas e funciona uma única
                    vez. Se você abrir o link, entra como o aluno e sai da sua conta.
                </p>

                <form
                    onSubmit={(event) => void handleSubmit(event)}
                    className="space-y-4 rounded-xl border border-purple-500/30 bg-black/40 p-6"
                >
                    <label htmlFor="student-email" className="block text-sm font-medium" style={{ color: "#fff6e9" }}>
                        E-mail do aluno no CodeQuest
                    </label>
                    <input
                        id="student-email"
                        type="email"
                        required
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="aluno@email.com"
                        className="input-8bit w-full"
                        disabled={loading}
                    />

                    <button
                        type="submit"
                        disabled={loading || !email.trim()}
                        className="inline-flex h-10 w-full items-center justify-center px-4 py-2 text-sm rpg-button disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Gerando...
                            </>
                        ) : (
                            <>
                                <Link2 className="mr-2 h-4 w-4" />
                                Gerar link de acesso
                            </>
                        )}
                    </button>

                    <FormFeedback kind="error" message={error} />
                </form>

                {generated ? (
                    <section className="mt-6 space-y-4 rounded-xl border border-emerald-500/40 bg-black/40 p-6">
                        <p style={{ color: "#fff6e9" }}>
                            Link para <strong>{generated.student.name}</strong> ({generated.student.email})
                        </p>

                        <input
                            readOnly
                            value={generated.url}
                            onFocus={(event) => event.currentTarget.select()}
                            className="w-full rounded-md border border-zinc-700 bg-zinc-900 p-3 font-mono text-xs text-zinc-100"
                        />

                        <button
                            type="button"
                            onClick={() => void handleCopy()}
                            className="inline-flex h-10 w-full items-center justify-center px-4 py-2 text-sm rpg-button"
                        >
                            {copied ? (
                                <>
                                    <Check className="mr-2 h-4 w-4" />
                                    Copiado!
                                </>
                            ) : (
                                <>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Copiar link
                                </>
                            )}
                        </button>

                        <p className="text-sm" style={{ color: "#fff6e9", opacity: 0.75 }}>
                            Expira em {formatExpiry(generated.expiresAt)}. Depois de usado uma vez, para de funcionar.
                        </p>
                    </section>
                ) : null}
            </main>
        </div>
    );
}
