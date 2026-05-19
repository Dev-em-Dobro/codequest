"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Mail, Shield, Sparkles } from "lucide-react";
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

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
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
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar ao Inicio
                    </Link>

                    <div className="w-20 h-20 rounded-full bg-purple-500/20 border-2 border-purple-500 mx-auto mb-4 flex items-center justify-center">
                        <Image src="/avatars/logo.png" alt="CodeQuest" width={64} height={64} className="w-16 h-16 object-contain rounded-full" />
                    </div>

                    <h1 className="text-3xl font-bold mb-2" style={{ color: "#fff6e9" }}>
                        Portal da Guilda
                    </h1>
                    <p style={{ color: "#fff6e9", opacity: 0.8 }}>
                        Entre em sua conta para continuar sua jornada
                    </p>
                </div>

                <div className="mb-6 p-4 border rounded-lg bg-blue-900/20 border-blue-500/30">
                    <div className="text-center">
                        <Sparkles className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                        <h3 className="font-bold mb-2" style={{ color: "#fff6e9" }}>
                            Primeiro Acesso?
                        </h3>
                        <p className="text-sm mb-3" style={{ color: "#fff6e9", opacity: 0.8 }}>
                            Crie sua conta e comece sua aventura de programacao!
                        </p>
                        <button
                            type="button"
                            onClick={() => router.push("/auth/signup")}
                            className="mt-2 w-full rpg-button"
                        >
                            Criar Nova Conta
                        </button>
                    </div>
                </div>

                <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: "#fff6e9" }}>
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3.5 w-4 h-4 text-purple-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    className="input-8bit pl-10 w-full"
                                    placeholder="seu@email.com"
                                    disabled={isSubmitting}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: "#fff6e9" }}>
                                Senha
                            </label>
                            <div className="relative">
                                <Shield className="absolute left-3 top-3.5 w-4 h-4 text-purple-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    className="input-8bit pl-10 w-full"
                                    placeholder="Sua senha"
                                    disabled={isSubmitting}
                                    required
                                />
                            </div>
                        </div>

                        {error ? (
                            <div className="p-3 rounded-md text-sm bg-red-900/30 border border-red-500/50 text-red-300">
                                {error}
                            </div>
                        ) : null}

                        <button
                            type="submit"
                            className="w-full rpg-button"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Entrando..." : "Entrar na Guilda"}
                        </button>
                    </form>

                    <div className="mt-6 text-center space-y-2">
                        <Link href="/auth/forgot-password" className="block text-purple-400 hover:text-purple-300 text-sm transition-colors">
                            Esqueceu sua senha?
                        </Link>
                        <p className="text-sm" style={{ color: "#fff6e9", opacity: 0.8 }}>
                            Nao tem conta?{" "}
                            <Link href="/auth/signup" className="text-purple-400 hover:text-purple-300 transition-colors">
                                Criar conta
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
