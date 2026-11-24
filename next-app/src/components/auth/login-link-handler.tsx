"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FormFeedback } from "@/components/auth/form-feedback";
import { useAuth } from "@/hooks/use-auth";

/**
 * Troca o token do link (/auth/link?token=...) por uma sessão.
 * O token só é usado aqui, no navegador: prévias de link (WhatsApp etc.) não executam JS,
 * então não "gastam" o link antes do aluno abrir.
 */
export function LoginLinkHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { signInWithLoginLink } = useAuth();
    // Lido uma vez: o token sai da URL logo abaixo, então não pode depender do searchParams depois.
    const [token] = useState(() => searchParams.get("token")?.trim() ?? "");
    const [error, setError] = useState<string | null>(
        token ? null : "Link de acesso incompleto. Confira se copiou o link inteiro.",
    );
    const startedRef = useRef(false);

    useEffect(() => {
        // Evita usar o link duas vezes (StrictMode roda efeitos em dobro em dev).
        if (startedRef.current || !token) {
            return;
        }
        startedRef.current = true;

        // Tira o token da barra de endereço/histórico assim que ele é lido.
        globalThis.history.replaceState(null, "", "/auth/link");

        signInWithLoginLink(token)
            .then(() => router.replace("/"))
            .catch((linkError: unknown) => {
                setError(
                    linkError instanceof Error && linkError.message
                        ? linkError.message
                        : "Não foi possível entrar com este link.",
                );
            });
    }, [router, token, signInWithLoginLink]);

    if (error) {
        return (
            <div className="mt-6 space-y-4">
                <FormFeedback kind="error" message={error} />
                <div className="text-center">
                    <Link href="/auth/signin" className="text-sm font-medium hover:underline" style={{ color: "#9d4edd" }}>
                        Ir para o login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-6 flex items-center justify-center gap-2" style={{ color: "#fff6e9", opacity: 0.8 }}>
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-purple-400 border-t-transparent" />
            Entrando na sua conta...
        </div>
    );
}
