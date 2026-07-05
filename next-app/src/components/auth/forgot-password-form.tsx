"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { FieldError, FormFeedback } from "@/components/auth/form-feedback";
import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth";

export function ForgotPasswordForm() {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ForgotPasswordInput>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: "" },
    });

    const onSubmit = handleSubmit(async (values) => {
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: values.email }),
            });

            const payload = (await response.json()) as { message?: string; error?: string };

            if (!response.ok) {
                setErrorMessage(payload.message || payload.error || "Não foi possível processar sua solicitação.");
                return;
            }

            setSuccessMessage(
                payload.message ||
                    "Se este e-mail existir no sistema, você receberá um link para redefinir sua senha.",
            );
        } catch {
            setErrorMessage("Não foi possível processar sua solicitação agora. Tente novamente em instantes.");
        }
    });

    return (
        <>
            <AuthFormShell onSubmit={onSubmit} className="mt-6 space-y-4">
                <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium" style={{ color: "#fff6e9", opacity: 0.9 }}>
                        E-mail
                    </label>
                    <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="seu@email.com"
                        className="input-8bit w-full"
                        disabled={isSubmitting}
                        {...register("email")}
                    />
                    <FieldError message={errors.email?.message} />
                </div>

                <FormFeedback kind="error" message={errorMessage} />
                <FormFeedback kind="success" message={successMessage} />

                <button
                    type="button"
                    onClick={() => void onSubmit()}
                    disabled={isSubmitting}
                    className="rpg-button flex w-full items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Enviando...
                        </>
                    ) : (
                        "Enviar link de recuperação"
                    )}
                </button>
            </AuthFormShell>

            <div className="mt-5 text-center">
                <Link
                    href="/auth/signin"
                    className="mx-auto inline-flex items-center text-sm font-medium hover:underline"
                    style={{ color: "#9d4edd" }}
                >
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Voltar para o login
                </Link>
            </div>
        </>
    );
}
