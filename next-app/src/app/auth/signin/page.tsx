"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";

export default function SignInPage() {
    const router = useRouter();
    const { signIn, isAuthenticated, isLoading: authLoading } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const redirectPath = useMemo(() => {
        if (globalThis.window === undefined) {
            return "/";
        }

        const requestedPath = new URLSearchParams(globalThis.location.search).get("redirect");
        if (!requestedPath?.startsWith("/")) {
            return "/";
        }

        return requestedPath;
    }, []);

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            router.replace(redirectPath);
        }
    }, [authLoading, isAuthenticated, redirectPath, router]);

    const handleSubmit = async (event: { preventDefault: () => void }) => {
        event.preventDefault();

        if (!email.trim() || !password.trim()) {
            setError("Preencha email e senha para continuar.");
            return;
        }

        setError(null);
        setIsSubmitting(true);

        try {
            await signIn({
                email: email.trim(),
                password,
            });

            router.replace(redirectPath);
        } catch (submitError) {
            const message = submitError instanceof Error ? submitError.message : "Falha no login";
            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 text-zinc-900">
            <section className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
                <h1 className="text-2xl font-semibold tracking-tight">Entrar no CodeQuest</h1>
                <p className="mt-2 text-sm text-zinc-600">Use seu email e senha para iniciar a sessao.</p>

                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-1">
                        <label htmlFor="email" className="text-sm font-medium text-zinc-700">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            autoComplete="email"
                            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-zinc-900/10 transition focus:ring"
                            placeholder="voce@exemplo.com"
                            disabled={isSubmitting}
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="password" className="text-sm font-medium text-zinc-700">
                            Senha
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            autoComplete="current-password"
                            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-zinc-900/10 transition focus:ring"
                            placeholder="Sua senha"
                            disabled={isSubmitting}
                            required
                        />
                    </div>

                    {error ? (
                        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
                    ) : null}

                    <button
                        type="submit"
                        className="w-full rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Entrando..." : "Entrar"}
                    </button>
                </form>

                <div className="mt-5 flex flex-col gap-2 text-sm">
                    <Link href="/auth/forgot-password" className="text-zinc-600 hover:text-zinc-900">
                        Esqueci minha senha
                    </Link>
                    <p className="text-zinc-600">
                        Primeiro acesso?{" "}
                        <Link href="/auth/signup" className="font-medium text-zinc-900 hover:underline">
                            Crie sua conta
                        </Link>
                    </p>
                </div>
            </section>
        </main>
    );
}
