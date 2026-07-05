"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { FormFeedback } from "@/components/auth/form-feedback";
import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { PasswordField } from "@/components/auth/password-field";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth";

export function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token")?.trim() ?? "";

    const [requestError, setRequestError] = useState<string | null>(null);
    const [isDone, setIsDone] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordInput>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = handleSubmit(async (values) => {
        if (!token) {
            setRequestError("Link de redefinição inválido ou expirado.");
            return;
        }

        setRequestError(null);

        try {
            const response = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password: values.password }),
            });

            const payload = (await response.json()) as { message?: string; error?: string };

            if (!response.ok) {
                setRequestError(payload.message || payload.error || "Não foi possível redefinir sua senha.");
                return;
            }

            setIsDone(true);
        } catch {
            setRequestError("Não foi possível redefinir sua senha. Tente novamente.");
        }
    });

    if (!token) {
        return (
            <div className="mt-6 space-y-4 text-center">
                <p className="text-base leading-relaxed" style={{ color: "#fff6e9", opacity: 0.9 }}>
                    Este link de recuperação está incompleto ou expirou. Solicite um novo link para redefinir sua senha.
                </p>
                <Link href="/auth/forgot-password" className="rpg-button inline-flex items-center justify-center">
                    Solicitar novo link
                </Link>
            </div>
        );
    }

    if (isDone) {
        return (
            <div className="mt-6 space-y-4">
                <FormFeedback kind="success" message="Sua senha foi redefinida com sucesso." />
                <Link href="/auth/signin" className="rpg-button flex w-full items-center justify-center">
                    Ir para login
                </Link>
            </div>
        );
    }

    return (
        <>
            <AuthFormShell onSubmit={onSubmit} className="mt-6 space-y-4">
                <PasswordField
                    id="password"
                    label="Nova senha"
                    placeholder="Mínimo 8 caracteres"
                    register={register}
                    error={errors.password?.message}
                    disabled={isSubmitting}
                />

                <PasswordField
                    id="confirmPassword"
                    label="Confirmar nova senha"
                    placeholder="Repita sua nova senha"
                    register={register}
                    error={errors.confirmPassword?.message}
                    disabled={isSubmitting}
                />

                <FormFeedback kind="error" message={requestError} />

                <button type="button" onClick={() => void onSubmit()} disabled={isSubmitting} className="rpg-button flex w-full items-center justify-center gap-2">
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Redefinindo...
                        </>
                    ) : (
                        "Redefinir senha"
                    )}
                </button>
            </AuthFormShell>

            <div className="mt-5 text-center">
                <Link href="/auth/signin" className="text-sm font-medium hover:underline" style={{ color: "#9d4edd" }}>
                    Voltar para login
                </Link>
            </div>
        </>
    );
}
