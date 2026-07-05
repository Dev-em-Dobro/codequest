"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock, MessageCircle } from "lucide-react";
import { Header } from "@/components/layout/header";
import { FieldError } from "@/components/auth/form-feedback";
import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { useAuth } from "@/hooks/use-auth";
import { signUpEmailSchema, signUpSchema, type SignUpInput } from "@/lib/validations/auth";

type ValidateEmailResponse = {
    isValid?: boolean;
    userExists?: boolean;
    message?: string;
    error?: string;
};

export default function SignUpPage() {
    const router = useRouter();
    const { signUp, isAuthenticated, isLoading: authLoading } = useAuth();

    const [isValidatingEmail, setIsValidatingEmail] = useState(false);
    const [emailValidated, setEmailValidated] = useState(false);
    const [showRegistrationFields, setShowRegistrationFields] = useState(false);
    const [requestError, setRequestError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        getValues,
        setError: setFieldError,
        clearErrors,
        reset,
    } = useForm<SignUpInput>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            router.replace("/");
        }
    }, [authLoading, isAuthenticated, router]);

    const validateEmail = async (email: string): Promise<boolean> => {
        setRequestError(null);
        setIsValidatingEmail(true);

        try {
            const response = await fetch("/api/auth/validate-email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const result = (await response.json()) as ValidateEmailResponse;

            if (result.userExists) {
                setRequestError(result.message || "Este email já possui uma conta. Faça login para continuar.");
                setEmailValidated(false);
                setShowRegistrationFields(false);
                return false;
            }

            if (result.isValid) {
                setEmailValidated(true);
                setShowRegistrationFields(true);
                setRequestError(null);
                return true;
            }

            setEmailValidated(false);
            setShowRegistrationFields(false);
            setRequestError(result.message || "Este email não está cadastrado no DevQuest.");
            return false;
        } catch {
            setRequestError("Erro ao validar email. Tente novamente.");
            return false;
        } finally {
            setIsValidatingEmail(false);
        }
    };

    const submitSignUp = handleSubmit(async (values) => {
        setRequestError(null);

        try {
            await signUp({
                name: values.name,
                email: values.email,
                password: values.password,
            });

            router.replace("/");
        } catch (submitError) {
            const message = submitError instanceof Error ? submitError.message : "Erro ao criar conta. Tente novamente.";
            setRequestError(message);
        }
    });

    const onSubmit = async () => {
        if (!emailValidated) {
            const emailResult = signUpEmailSchema.safeParse({ email: getValues("email") });

            if (!emailResult.success) {
                const issue = emailResult.error.issues[0];
                setFieldError("email", { message: issue?.message ?? "Digite um e-mail válido" });
                return;
            }

            clearErrors("email");
            const valid = await validateEmail(emailResult.data.email);
            if (valid) {
                reset({
                    name: "",
                    email: emailResult.data.email,
                    password: "",
                    confirmPassword: "",
                });
            }
            return;
        }

        await submitSignUp();
    };

    const handleEmailChange = () => {
        if (emailValidated || showRegistrationFields) {
            setEmailValidated(false);
            setShowRegistrationFields(false);
            setRequestError(null);
        }
    };

    const showWhatsAppSupport = Boolean(requestError && (requestError.includes("não está cadastrado") || requestError.includes("nao esta cadastrado")));
    const showLoginShortcut = Boolean(requestError && (requestError.includes("já possui uma conta") || requestError.includes("ja possui uma conta")));
    const busy = isSubmitting || isValidatingEmail;

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

                    {requestError ? (
                        <div
                            className="mt-5 rounded-md border p-3 text-sm"
                            style={{
                                backgroundColor: showWhatsAppSupport ? "#ffffff" : showLoginShortcut ? "#dbeafe" : "rgba(127,29,29,0.38)",
                                borderColor: showWhatsAppSupport ? "#ef4444" : showLoginShortcut ? "#3b82f6" : "rgba(239,68,68,0.45)",
                                color: showWhatsAppSupport ? "#ef4444" : showLoginShortcut ? "#1e40af" : "#fecaca",
                                fontWeight: showWhatsAppSupport || showLoginShortcut ? 500 : 400,
                            }}
                        >
                            {requestError}
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

                    <AuthFormShell onSubmit={onSubmit} className="mt-5 space-y-4">
                        <div className="space-y-2">
                            <div className="relative">
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="Qual seu email do DevQuest?"
                                    className="input-8bit w-full"
                                    disabled={busy}
                                    {...register("email", {
                                        onChange: handleEmailChange,
                                    })}
                                />
                                {isValidatingEmail ? (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <Loader2 className="h-4 w-4 animate-spin" style={{ color: "#9d4edd" }} />
                                    </div>
                                ) : null}
                            </div>
                            <FieldError message={errors.email?.message} />
                        </div>

                        {emailValidated && showRegistrationFields ? (
                            <>
                                <div className="space-y-2">
                                    <input
                                        id="name"
                                        type="text"
                                        autoComplete="name"
                                        placeholder="Seu nome completo"
                                        className="input-8bit w-full"
                                        disabled={isSubmitting}
                                        {...register("name")}
                                    />
                                    <FieldError message={errors.name?.message} />
                                </div>

                                <div className="space-y-2">
                                    <input
                                        id="password"
                                        type="password"
                                        autoComplete="new-password"
                                        placeholder="Crie uma senha (mínimo 8 caracteres)"
                                        className="input-8bit w-full"
                                        disabled={isSubmitting}
                                        {...register("password")}
                                    />
                                    <FieldError message={errors.password?.message} />
                                </div>

                                <div className="space-y-2">
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        autoComplete="new-password"
                                        placeholder="Confirme sua senha"
                                        className="input-8bit w-full"
                                        disabled={isSubmitting}
                                        {...register("confirmPassword")}
                                    />
                                    <FieldError message={errors.confirmPassword?.message} />
                                </div>
                            </>
                        ) : null}

                        <button type="button" onClick={() => void onSubmit()} className="w-full rpg-button" disabled={busy}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                                    Criando conta...
                                </>
                            ) : isValidatingEmail ? (
                                <>
                                    <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                                    Validando email...
                                </>
                            ) : !emailValidated ? (
                                "Validar Email"
                            ) : (
                                "Criar Conta"
                            )}
                        </button>
                    </AuthFormShell>

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
