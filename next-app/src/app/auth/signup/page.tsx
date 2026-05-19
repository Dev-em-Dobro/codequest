"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, CheckCircle, Mail, Shield, User } from "lucide-react";
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
    const [showRegistrationFields, setShowRegistrationFields] = useState(false);
    const [showHelpContact, setShowHelpContact] = useState(false);
    const [existingUser, setExistingUser] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

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
        setSuccess(null);
        setExistingUser(false);
        setShowHelpContact(false);
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
                setExistingUser(true);
                setError("Este email ja esta cadastrado. Faca login para continuar.");
                setShowRegistrationFields(false);
                return false;
            }

            if (result.isValid) {
                setShowRegistrationFields(true);
                setSuccess("Email validado! Agora complete seu cadastro.");
                return true;
            }

            setShowRegistrationFields(false);
            setError(result.message || "Email nao encontrado na base da formacao.");
            setShowHelpContact(true);
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

        if (!showRegistrationFields) {
            return;
        }

        if (!name.trim() || !password.trim()) {
            setError("Preencha todos os campos");
            return;
        }

        if (password.length < 8) {
            setError("A senha deve ter pelo menos 8 caracteres");
            return;
        }

        if (password !== confirmPassword) {
            setError("As senhas nao coincidem");
            return;
        }

        setError(null);
        setSuccess(null);
        setIsSubmitting(true);

        try {
            await signUp({
                name: name.trim(),
                email: email.trim(),
                password,
            });

            router.replace("/");
        } catch (submitError) {
            const message = submitError instanceof Error ? submitError.message : "Erro ao criar conta";
            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                <div className="text-center mb-8">
                    <Link href="/auth/signin" className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar ao Login
                    </Link>

                    <div className="w-20 h-20 rounded-full bg-purple-500/20 border-2 border-purple-500 mx-auto mb-4 flex items-center justify-center">
                        <Image src="/avatars/logo.png" alt="CodeQuest" width={64} height={64} className="w-16 h-16 object-contain rounded-full" />
                    </div>

                    <h1 className="text-3xl font-bold mb-2" style={{ color: "#fff6e9" }}>
                        Nova Conta da Guilda
                    </h1>
                    <p style={{ color: "#fff6e9", opacity: 0.8 }}>
                        Valide seu email de formacao para iniciar sua jornada
                    </p>
                </div>

                <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: "#fff6e9" }}>
                                Email da Formacao
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3.5 w-4 h-4 text-purple-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(event) => {
                                        setEmail(event.target.value);
                                        setShowRegistrationFields(false);
                                        setExistingUser(false);
                                        setShowHelpContact(false);
                                        setError(null);
                                        setSuccess(null);
                                    }}
                                    className="input-8bit pl-10 w-full"
                                    placeholder="seu@email.com"
                                    disabled={isValidatingEmail || showRegistrationFields || isSubmitting}
                                    required
                                />
                            </div>
                        </div>

                        {!showRegistrationFields ? (
                            <button
                                type="button"
                                onClick={() => {
                                    void validateEmail();
                                }}
                                disabled={isValidatingEmail || isSubmitting}
                                className="w-full rpg-button"
                            >
                                {isValidatingEmail ? "Validando email..." : "Validar Email"}
                            </button>
                        ) : null}

                        {showRegistrationFields ? (
                            <>
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: "#fff6e9" }}>
                                        Nome Completo
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3.5 w-4 h-4 text-purple-400" />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(event) => setName(event.target.value)}
                                            className="input-8bit pl-10 w-full"
                                            placeholder="Seu nome completo"
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
                                            placeholder="Minimo 8 caracteres"
                                            minLength={8}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: "#fff6e9" }}>
                                        Confirmar Senha
                                    </label>
                                    <div className="relative">
                                        <Shield className="absolute left-3 top-3.5 w-4 h-4 text-purple-400" />
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(event) => setConfirmPassword(event.target.value)}
                                            className="input-8bit pl-10 w-full"
                                            placeholder="Confirme sua senha"
                                            minLength={8}
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || isValidatingEmail}
                                    className="w-full rpg-button"
                                >
                                    {isSubmitting ? "Criando conta..." : "Criar Conta"}
                                </button>
                            </>
                        ) : null}

                        {error ? (
                            <div className="p-3 rounded-md text-sm bg-red-900/30 border border-red-500/50 text-red-300 flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        ) : null}

                        {success ? (
                            <div className="p-3 rounded-md text-sm bg-green-900/30 border border-green-500/50 text-green-300 flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>{success}</span>
                            </div>
                        ) : null}

                        {existingUser ? (
                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => router.push("/auth/signin")}
                                    className="text-purple-400 hover:text-purple-300 text-sm underline transition-colors"
                                >
                                    Ir para login
                                </button>
                            </div>
                        ) : null}

                        {showHelpContact ? (
                            <div className="text-center p-4 bg-blue-900/20 border border-blue-500/30 rounded-md">
                                <p className="text-sm mb-3" style={{ color: "#fff6e9", opacity: 0.9 }}>
                                    Precisa de ajuda para validar seu email?
                                </p>
                                <a
                                    href="https://wa.me/5511968943004"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-green-400 hover:text-green-300 text-sm font-medium transition-colors"
                                >
                                    📱 Falar no WhatsApp
                                </a>
                            </div>
                        ) : null}
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm" style={{ color: "#fff6e9", opacity: 0.8 }}>
                            Ja tem conta?{" "}
                            <Link href="/auth/signin" className="text-purple-400 hover:text-purple-300 transition-colors">
                                Fazer login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
