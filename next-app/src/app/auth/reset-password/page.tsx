import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

function ResetPasswordFallback() {
    return (
        <div className="mt-6 flex items-center justify-center gap-2" style={{ color: "#fff6e9", opacity: 0.8 }}>
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-purple-400 border-t-transparent" />
            Carregando formulário...
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-black">
            <Header />
            <div className="flex items-center justify-center p-4 pt-20">
                <div className="w-full max-w-2xl rounded-2xl border border-purple-500/40 bg-black/45 p-6 shadow-[0_0_35px_rgba(157,78,221,0.25)] backdrop-blur-sm">
                    <div className="space-y-1 text-center">
                        <h1 className="text-2xl font-bold" style={{ color: "#fff6e9", fontFamily: "var(--font-retro)" }}>
                            Definir nova senha
                        </h1>
                        <p style={{ color: "#fff6e9", opacity: 0.8 }}>
                            Escolha uma nova senha para acessar sua conta
                        </p>
                    </div>

                    <Suspense fallback={<ResetPasswordFallback />}>
                        <ResetPasswordForm />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
