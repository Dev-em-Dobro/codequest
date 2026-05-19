import Link from "next/link";
import { ArrowLeft, MessageCircle, ShieldAlert } from "lucide-react";

export default function ForgotPasswordPage() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/auth/signin" className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar ao Login
                    </Link>

                    <div className="w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500 mx-auto mb-4 flex items-center justify-center">
                        <ShieldAlert className="w-10 h-10 text-red-400" />
                    </div>

                    <h1 className="text-3xl font-bold mb-2" style={{ color: "#fff6e9" }}>
                        Recuperar Senha
                    </h1>
                    <p style={{ color: "#fff6e9", opacity: 0.8 }}>
                        Entre em contato com o suporte para redefinir sua senha
                    </p>
                </div>

                <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-6 text-center">
                    <div className="mb-6">
                        <MessageCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                        <h2 className="text-xl font-bold mb-2" style={{ color: "#fff6e9" }}>
                            Suporte via WhatsApp
                        </h2>
                        <p className="text-sm" style={{ color: "#fff6e9", opacity: 0.8 }}>
                            Nossa equipe esta pronta para ajudar voce a recuperar o acesso a sua conta.
                        </p>
                    </div>

                    <a
                        href="https://wa.me/5511968943004"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full rpg-button flex items-center justify-center gap-2"
                    >
                        <MessageCircle className="w-5 h-5" />
                        Falar no WhatsApp
                    </a>

                    <p className="text-xs mt-4" style={{ color: "#fff6e9", opacity: 0.6 }}>
                        Atendimento de segunda a sexta, das 9h as 18h
                    </p>
                </div>
            </div>
        </div>
    );
}
