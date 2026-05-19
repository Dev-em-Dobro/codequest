"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";

type ValidateEmailResponse = {
    isValid?: boolean;
    userExists?: boolean;
    message?: string;
    error?: string;
};

export default function SignUpPage() {
    const router = useRouter();
    const { signUp, isAuthenticated, isLoading: authLoading } = useAuth();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [emailValidated, setEmailValidated] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isValidatingEmail, setIsValidatingEmail] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            router.replace("/");
        }
    }, [authLoading, isAuthenticated, router]);

    const validateEmail = async (): Promise<boolean> => {
        if (!email.trim()) {
            setError("Digite o email usado na formacao.");
            return false;
        }

        setError(null);
        setMessage(null);
        setIsValidatingEmail(true);

        try {
            const response = await fetch("/api/auth/validate-email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: email.trim() }),
            });

            const result = (await response.json()) as ValidateEmailResponse;

            if (!response.ok || result.error) {
                setEmailValidated(false);
                setError(result.error || "Nao foi possivel validar o email.");
                return false;
            }

            if (!result.isValid) {
                setEmailValidated(false);
                setError(result.message || "Email invalido para cadastro.");
                return false;
            }

            setEmailValidated(true);
            setMessage(result.message || "Email validado com sucesso.");
            return true;
        } catch {
            setEmailValidated(false);
            setError("Falha ao validar email. Tente novamente.");
            return false;
        } finally {
            setIsValidatingEmail(false);
        }
    };

    const handleSubmit = async (event: { preventDefault: () => void }) => {
        event.preventDefault();

        if (!emailValidated) {
            await validateEmail();
            return;
        }

        if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
            setError("Preencha todos os campos.");
            return;
        }

        if (password !== confirmPassword) {
            setError("As senhas nao coincidem.");
            return;
        }

        if (password.length < 8) {
            setError("A senha precisa ter ao menos 8 caracteres.");
            return;
        }

        setError(null);
        setMessage(null);
        setIsSubmitting(true);

        try {
            await signUp({
                name: name.trim(),
                email: email.trim(),
                password,
            });

            router.replace("/");
        } catch (submitError) {
            const submitMessage = submitError instanceof Error ? submitError.message : "Falha no cadastro";
            setError(submitMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 text-zinc-900">
            <section className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
                <h1 className="text-2xl font-semibold tracking-tight">Criar conta</h1>
                <p className="mt-2 text-sm text-zinc-600">Use o email validado da formacao para registrar seu acesso.</p>

                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-1">
                        <label htmlFor="email" className="text-sm font-medium text-zinc-700">
                            Email da formacao
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) => {
                                setEmail(event.target.value);
                                setEmailValidated(false);
                                setMessage(null);
                                setError(null);
                            }}
                            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-zinc-900/10 transition focus:ring"
                            placeholder="voce@exemplo.com"
                            disabled={isSubmitting || isValidatingEmail}
                            required
                        />
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            void validateEmail();
                        }}
                        className="w-full rounded-lg border border-zinc-300 bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={isSubmitting || isValidatingEmail}
                    >
                        {isValidatingEmail ? "Validando..." : "Validar email"}
                    </button>

                    {emailValidated ? (
                        <>
                            <div className="space-y-1">
                                <label htmlFor="name" className="text-sm font-medium text-zinc-700">
                                    Nome
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-zinc-900/10 transition focus:ring"
                                    placeholder="Seu nome completo"
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
                                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-zinc-900/10 transition focus:ring"
                                    placeholder="Minimo 8 caracteres"
                                    disabled={isSubmitting}
                                    minLength={8}
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-700">
                                    Confirmar senha
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(event) => setConfirmPassword(event.target.value)}
                                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-zinc-900/10 transition focus:ring"
                                    placeholder="Repita sua senha"
                                    disabled={isSubmitting}
                                    minLength={8}
                                    required
                                />
                            </div>
                        </>
                    ) : null}

                    {error ? (
                        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
                    ) : null}

                    {message ? (
                        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                            {message}
                        </p>
                    ) : null}

                    <button
                        type="submit"
                        className="w-full rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={isSubmitting || isValidatingEmail || !emailValidated}
                    >
                        {isSubmitting ? "Criando conta..." : "Criar conta"}
                    </button>
                </form>

                <p className="mt-5 text-sm text-zinc-600">
                    Ja tem conta?{" "}
                    <Link href="/auth/signin" className="font-medium text-zinc-900 hover:underline">
                        Fazer login
                    </Link>
                </p>
            </section>
        </main>
    );
}
