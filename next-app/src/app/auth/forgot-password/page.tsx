import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { Header } from "@/components/layout/header";

export default function ForgotPasswordPage() {
    return (
        <div className="min-h-screen bg-black">
            <Header />
            <div className="flex items-center justify-center p-4 pt-20">
                <div className="w-full max-w-2xl rounded-2xl border border-purple-500/40 bg-black/45 p-6 shadow-[0_0_35px_rgba(157,78,221,0.25)] backdrop-blur-sm">
                    <div className="space-y-1 text-center">
                        <h1 className="text-2xl font-bold" style={{ color: "#fff6e9", fontFamily: "var(--font-retro)" }}>
                            Esqueci minha senha
                        </h1>
                        <p style={{ color: "#fff6e9", opacity: 0.8 }}>
                            Redefinição de senha
                        </p>
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-base leading-relaxed" style={{ color: "#fff6e9", opacity: 0.9 }}>
                            Para redefinir sua senha, entre em contato com o nosso suporte pelo WhatsApp. Nossa equipe irá te ajudar rapidamente!
                        </p>
                    </div>

                    <a
                        href="http://wa.me/555197034968"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-6 w-full rpg-button flex items-center justify-center gap-2"
                    >
                        <MessageCircle className="h-5 w-5" />
                        Falar com o Suporte no WhatsApp
                    </a>

                    <div className="mt-5 text-center">
                        <Link href="/auth/signin" className="mx-auto inline-flex items-center text-sm font-medium hover:underline" style={{ color: "#9d4edd" }}>
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Voltar para o login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
