import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { GlowCard } from "@/components/ui/spotlight-card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/simple-auth-client";
import { Link, useLocation } from "wouter";
import { ChevronRight, Send, MessageSquare } from "lucide-react";
import { Header } from "@/components/header";

export default function Feedback() {
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!feedback.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, escreva seu feedback antes de enviar.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para enviar feedback.",
        variant: "destructive",
      });
      setLocation("/auth/signin");
      return;
    }

    setIsSubmitting(true);

    try {
      const sessionId = localStorage.getItem('codequest_session_id') || user.id;
      const response = await fetch('/api/feedbacks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId}`,
        },
        body: JSON.stringify({
          feedback: feedback.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Falha ao enviar feedback');
      }

      toast({
        title: "Feedback enviado!",
        description: "Obrigado por ajudar a melhorar o CodeQuest!",
      });

      setFeedback("");
    } catch (error) {
      console.error("Erro ao enviar feedback:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao enviar seu feedback. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link href="/" className="flex items-center text-slate-400 hover:text-purple-400 transition-colors">
                Início
              </Link>
            </li>
            <ChevronRight className="w-4 h-4 text-slate-600" />
            <li>
              <span className="text-purple-400 font-medium">Enviar Feedback</span>
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(157, 78, 221, 0.1)' }}
            >
              <MessageSquare className="w-10 h-10" style={{ color: '#9d4edd' }} />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4" style={{ color: '#9d4edd' }}>
            Enviar Feedback
          </h1>
          <p style={{ 
            color: 'white', 
            fontFamily: 'Inter,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif', 
            fontSize: '1.2rem', 
            lineHeight: '1.75rem', 
            fontWeight: '300',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Sua opinião é fundamental para melhorarmos a plataforma
          </p>
        </div>

        {/* Feedback Form */}
        <div className="max-w-2xl mx-auto">
          <GlowCard glowColor="purple" customSize={true}>
            <CardHeader>
              <CardTitle style={{ color: '#fff6e9' }}>Como podemos melhorar?</CardTitle>
              <CardDescription style={{ color: '#fff6e9', opacity: 0.8, fontSize: '1rem', marginTop: '0.5rem' }}>
                Se você encontrou algum problema ou tem algum feedback pra melhorar a plataforma, 
                envie abaixo por favor. Vai nos ajudar muito a melhorar o CodeQuest pra você!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Escreva seu feedback aqui... Pode ser uma sugestão, crítica, elogio ou relato de bug."
                    className="min-h-[250px] bg-gray-700/50 text-white border-purple-500/20 focus:border-purple-500 resize-none"
                    disabled={isSubmitting}
                    style={{ fontSize: '1rem' }}
                  />
                  <p className="text-sm mt-2" style={{ color: '#fff6e9', opacity: 0.6 }}>
                    Seu feedback será analisado pela nossa equipe
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full rpg-button" 
                  size="lg"
                  disabled={isSubmitting || !feedback.trim()}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Enviar Feedback
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </GlowCard>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="p-4 rounded-lg border border-purple-500/20" style={{ backgroundColor: 'rgba(157, 78, 221, 0.05)' }}>
              <h3 className="font-semibold mb-2" style={{ color: '#9d4edd' }}>
                🐛 Bugs
              </h3>
              <p className="text-sm" style={{ color: '#fff6e9', opacity: 0.8 }}>
                Encontrou algum erro? Descreva o problema detalhadamente
              </p>
            </div>

            <div className="p-4 rounded-lg border border-purple-500/20" style={{ backgroundColor: 'rgba(157, 78, 221, 0.05)' }}>
              <h3 className="font-semibold mb-2" style={{ color: '#9d4edd' }}>
                💡 Sugestões
              </h3>
              <p className="text-sm" style={{ color: '#fff6e9', opacity: 0.8 }}>
                Tem ideias para novos recursos ou melhorias?
              </p>
            </div>

            <div className="p-4 rounded-lg border border-purple-500/20" style={{ backgroundColor: 'rgba(157, 78, 221, 0.05)' }}>
              <h3 className="font-semibold mb-2" style={{ color: '#9d4edd' }}>
                ⭐ Elogios
              </h3>
              <p className="text-sm" style={{ color: '#fff6e9', opacity: 0.8 }}>
                Gostou de algo? Nos conte o que está funcionando bem!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}