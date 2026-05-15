import { Link } from "wouter";
import { CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { GlowCard } from "@/components/ui/spotlight-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { Header } from "@/components/header";

export default function ForgotPassword() {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <div className="flex items-center justify-center p-4 pt-20">
        <GlowCard glowColor="purple" customSize={true} className="w-full max-w-2xl">
          <CardHeader className="space-y-1 text-center">
            <h1 className="text-2xl font-bold" style={{ color: '#fff6e9', fontFamily: 'var(--font-retro)' }}>
              Esqueci minha senha
            </h1>
            <CardDescription style={{ color: '#fff6e9', opacity: 0.8 }}>
              Redefinição de senha
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-3">
              <p style={{ color: '#fff6e9', opacity: 0.9 }} className="text-base leading-relaxed">
                Para redefinir sua senha, entre em contato com o nosso suporte pelo WhatsApp. Nossa equipe irá te ajudar rapidamente!
              </p>
            </div>

            <a href="http://wa.me/555197034968" target="_blank" rel="noopener noreferrer">
              <Button className="w-full rpg-button flex items-center justify-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Falar com o Suporte no WhatsApp
              </Button>
            </a>

            <div className="text-center">
              <Link href="/auth/signin">
                <button
                  className="flex items-center justify-center mx-auto text-sm font-medium hover:underline"
                  style={{ color: '#9d4edd' }}
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Voltar para o login
                </button>
              </Link>
            </div>
          </CardContent>
        </GlowCard>
      </div>
    </div>
  );
}
