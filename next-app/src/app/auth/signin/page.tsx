"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GraduationCap, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/header";
import { GlowCard } from "@/components/ui/spotlight-card";
import { FieldError } from "@/components/auth/form-feedback";
import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { useAuth } from "@/hooks/use-auth";
import { signInSchema, type SignInInput } from "@/lib/validations/auth";

export default function SignInPage() {
    const router = useRouter();
    const { signIn, isAuthenticated, isLoading: authLoading } = useAuth();
    const [error, setError] = useState<string | null>(null);

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

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignInInput>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            router.replace(redirectPath);
        }
    }, [authLoading, isAuthenticated, redirectPath, router]);

    const onSubmit = handleSubmit(async (values) => {
        setError(null);

        try {
            await signIn({
                email: values.email,
                password: values.password,
            });

            router.replace(redirectPath);
        } catch (submitError: unknown) {
            let errorMessage = "Erro ao fazer login. Tente novamente.";

            if (submitError instanceof Error && submitError.message) {
                if (submitError.message.includes("auth/invalid-credential")) {
                    errorMessage = "Email ou senha incorretos. Verifique suas credenciais.";
                } else if (submitError.message.includes("auth/user-not-found")) {
                    errorMessage = "Usuário não encontrado. Verifique o email digitado.";
                } else if (submitError.message.includes("auth/wrong-password")) {
                    errorMessage = "Senha incorreta. Tente novamente.";
                } else if (submitError.message.includes("auth/invalid-email")) {
                    errorMessage = "Email inválido. Verifique o formato do email.";
                } else if (submitError.message.includes("auth/user-disabled")) {
                    errorMessage = "Esta conta foi desativada. Entre em contato com o suporte.";
                } else if (submitError.message.includes("auth/too-many-requests")) {
                    errorMessage = "Muitas tentativas de login. Tente novamente mais tarde.";
                } else {
                    errorMessage = submitError.message;
                }
            }

            setError(errorMessage);
        }
    });

    const handleFirstAccess = () => {
        router.push("/auth/signup");
    };

    const isCredentialError =
        Boolean(error) &&
        (error?.includes("Email ou senha incorretos") || error?.includes("Email ou senha inválidos"));

    return (
        <div className="min-h-screen bg-black">
            <Header />
            <div className="flex items-center justify-center p-4 pt-20">
                <GlowCard glowColor="purple" customSize className="w-full max-w-2xl">
                    <div className="space-y-2 p-6 text-center">
                        <h1 className="text-2xl font-bold" style={{ color: "#fff6e9", fontFamily: "var(--font-retro)" }}>
                            Entrar no CodeQuest
                        </h1>
                        <p className="text-lg" style={{ color: "#fff6e9", opacity: 0.9 }}>
                            Faça login para continuar sua jornada de aprendizado
                        </p>
                    </div>

                    <div className="space-y-6 p-6 pt-0">
                        <section
                            className="rounded-xl border p-5"
                            style={{
                                background: "linear-gradient(180deg, rgba(8, 13, 18, 0.95) 0%, rgba(9, 24, 18, 0.85) 100%)",
                                borderColor: "rgba(157, 78, 221, 0.65)",
                                boxShadow: "0 0 24px rgba(16, 185, 129, 0.14)",
                            }}
                        >
                            <p className="mb-4 text-xl font-semibold" style={{ color: "#00e5b3", fontFamily: "var(--font-retro)" }}>
                                Aluno da formação? Comece por aqui.
                            </p>
                            <p className="mt-2 text-lg" style={{ color: "#fff6e9", opacity: 0.9 }}>
                                No primeiro acesso, ative sua conta antes de entrar com e-mail e senha.
                            </p>
                            <button
                                type="button"
                                onClick={handleFirstAccess}
                                className="mt-5 inline-flex h-10 w-full items-center justify-center px-4 py-2 text-sm rpg-button"
                            >
                                <GraduationCap className="mr-2 h-4 w-4" />
                                Primeiro acesso de aluno
                            </button>
                        </section>

                        {error ? (
                            <div
                                className="rounded-md border p-3 text-sm"
                                style={{
                                    backgroundColor: isCredentialError ? "#ffffff" : "rgba(127,29,29,0.38)",
                                    borderColor: isCredentialError ? "#ef4444" : "rgba(239,68,68,0.45)",
                                    color: isCredentialError ? "#ef4444" : "#fecaca",
                                    fontWeight: isCredentialError ? 500 : 400,
                                }}
                            >
                                {error}
                            </div>
                        ) : null}

                        <AuthFormShell onSubmit={onSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="Digite seu email"
                                    className="input-8bit w-full"
                                    disabled={isSubmitting}
                                    {...register("email")}
                                />
                                <FieldError message={errors.email?.message} />
                            </div>

                            <div className="space-y-2">
                                <input
                                    id="password"
                                    type="password"
                                    autoComplete="current-password"
                                    placeholder="Digite sua senha"
                                    className="input-8bit w-full"
                                    disabled={isSubmitting}
                                    {...register("password")}
                                />
                                <FieldError message={errors.password?.message} />
                            </div>

                            <button
                                type="button"
                                onClick={() => void onSubmit()}
                                className="inline-flex h-10 w-full items-center justify-center px-4 py-2 text-sm rpg-button"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Entrando...
                                    </>
                                ) : (
                                    "Entrar"
                                )}
                            </button>
                        </AuthFormShell>

                        <div className="text-center">
                            <Link href="/auth/forgot-password" className="text-sm font-medium hover:underline" style={{ color: "#9d4edd" }}>
                                Esqueci minha senha
                            </Link>
                        </div>

                        <div className="text-center text-sm">
                            <span style={{ color: "#fff6e9", opacity: 0.8 }}>Não tem uma conta? </span>
                            <Link href="/auth/signup" className="font-medium" style={{ color: "#9d4edd" }}>
                                Cadastre-se
                            </Link>
                        </div>
                    </div>
                </GlowCard>
            </div>
        </div>
    );
}
