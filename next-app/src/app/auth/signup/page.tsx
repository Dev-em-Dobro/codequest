"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { Loader2, Lock, MessageCircle } from "lucide-react";
import { Header } from "@/components/layout/header";
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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isValidatingEmail, setIsValidatingEmail] = useState(false);
    const [emailValidated, setEmailValidated] = useState(false);
    const [showRegistrationFields, setShowRegistrationFields] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            router.replace("/");
        }
    }, [authLoading, isAuthenticated, router]);

    const validateEmail = async (): Promise<boolean> => {
        if (!email.trim()) {
            setError("Por favor, digite seu email do DevQuest");
            return false;
        }

        setError(null);
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

            if (result.userExists) {
                setError(result.message || "Este email já possui uma conta. Faça login para continuar.");
                setEmailValidated(false);
                setShowRegistrationFields(false);
                return false;
            }

            if (result.isValid) {
                setEmailValidated(true);
                setShowRegistrationFields(true);
                setError(null);
                return true;
            }

            setEmailValidated(false);
            setShowRegistrationFields(false);
            setError(result.message || "Este email não está cadastrado no DevQuest.");
            return false;
        } catch {
            setError("Erro ao validar email. Tente novamente.");
            return false;
        } finally {
            setIsValidatingEmail(false);
        }
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!emailValidated) {
            await validateEmail();
            return;
        }

        if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
            setError("Por favor, preencha todos os campos");
            return;
        }

        if (password.length < 8) {
            setError("A senha deve ter pelo menos 8 caracteres.");
            return;
        }

        if (password !== confirmPassword) {
            setError("As senhas não coincidem");
            return;
        }

        setError(null);
        setIsSubmitting(true);

        try {
            await signUp({
                name: name.trim(),
                email: email.trim(),
                password,
            });

            router.replace("/");
        } catch (submitError) {
            const message = submitError instanceof Error ? submitError.message : "Erro ao criar conta. Tente novamente.";
            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const showWhatsAppSupport = Boolean(error && (error.includes("não está cadastrado") || error.includes("nao esta cadastrado")));
    const showLoginShortcut = Boolean(error && (error.includes("já possui uma conta") || error.includes("ja possui uma conta")));

    return (
        <div className="min-h-screen bg-black">
            <Header />
            <div className="flex items-center justify-center p-4 pt-20">
                <div className="w-full max-w-2xl rounded-2xl border border-purple-500/40 bg-black/45 p-6 shadow-[0_0_35px_rgba(157,78,221,0.25)] backdrop-blur-sm">
                    <div className="space-y-1 text-center">
                        <h1 className="text-2xl font-bold" style={{ color: "#fff6e9", fontFamily: "var(--font-retro)" }}>
                            Criar Conta
                        </h1>
                        <p style={{ color: "#fff6e9", opacity: 0.8 }}>
                            Parábens! Você recebeu acesso antecipado ao CodeQuest! Para acessar, basta criar sua conta com o mesmo email usado no DevQuest
                        </p>
                    </div>

                    {error ? (
                        <div
                            className="mt-5 rounded-md border p-3 text-sm"
                            style={{
                                backgroundColor: showWhatsAppSupport ? "#ffffff" : showLoginShortcut ? "#dbeafe" : "rgba(127,29,29,0.38)",
                                borderColor: showWhatsAppSupport ? "#ef4444" : showLoginShortcut ? "#3b82f6" : "rgba(239,68,68,0.45)",
                                color: showWhatsAppSupport ? "#ef4444" : showLoginShortcut ? "#1e40af" : "#fecaca",
                                fontWeight: showWhatsAppSupport || showLoginShortcut ? 500 : 400,
                            }}
                        >
                            {error}
                        </div>
                    ) : null}

                    {showWhatsAppSupport ? (
                        <button
                            type="button"
                            onClick={() => {
                                globalThis.open("http://wa.me/555197034968", "_blank");
                            }}
                            className="mt-3 w-full rounded-md bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
                        >
                            <MessageCircle className="mr-2 inline h-4 w-4" />
                            Contatar Suporte no WhatsApp
                        </button>
                    ) : null}

                    {showLoginShortcut ? (
                        <button
                            type="button"
                            onClick={() => router.push("/auth/signin")}
                            className="mt-3 w-full rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                        >
                            <Lock className="mr-2 inline h-4 w-4" />
                            Ir para Login
                        </button>
                    ) : null}

                    <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                        <div className="space-y-2">
                            <div className="relative">
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="Qual seu email do DevQuest?"
                                    value={email}
                                    onChange={(event) => {
                                        setEmail(event.target.value);
                                        setEmailValidated(false);
                                        setShowRegistrationFields(false);
                                        setError(null);
                                    }}
                                    className="input-8bit w-full"
                                    disabled={isSubmitting || isValidatingEmail}
                                    required
                                />
                                {isValidatingEmail ? (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <Loader2 className="h-4 w-4 animate-spin" style={{ color: "#9d4edd" }} />
                                    </div>
                                ) : null}
                            </div>
                        </div>

                        {emailValidated && showRegistrationFields ? (
                            <>
                                <div className="space-y-2">
                                    <div className="relative">
                                        <input
                                            id="name"
                                            type="text"
                                            placeholder="Seu nome completo"
                                            value={name}
                                            onChange={(event) => setName(event.target.value)}
                                            className="input-8bit w-full"
                                            disabled={isSubmitting}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="relative">
                                        <input
                                            id="password"
                                            type="password"
                                            placeholder="Crie uma senha (mínimo 8 caracteres)"
                                            value={password}
                                            onChange={(event) => setPassword(event.target.value)}
                                            className="input-8bit w-full"
                                            disabled={isSubmitting}
                                            required
                                            minLength={8}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="relative">
                                        <input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="Confirme sua senha"
                                            value={confirmPassword}
                                            onChange={(event) => setConfirmPassword(event.target.value)}
                                            className="input-8bit w-full"
                                            disabled={isSubmitting}
                                            required
                                        />
                                    </div>
                                </div>
                            </>
                        ) : null}

                        <button type="submit" className="w-full rpg-button" disabled={isSubmitting || isValidatingEmail}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                                    Criando conta...
                                </>
                            ) : !emailValidated ? (
                                "Validar Email"
                            ) : (
                                "Criar Conta"
                            )}
                        </button>
                    </form>

                    <div className="mt-5 text-center text-sm">
                        <span style={{ color: "#fff6e9", opacity: 0.8 }}>Já tem uma conta? </span>
                        <Link href="/auth/signin" className="font-medium" style={{ color: "#9d4edd" }}>
                            Faça login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
