import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { GlowCard } from "@/components/ui/spotlight-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, GraduationCap } from "lucide-react";
import { useAuth } from "../../lib/simple-auth-client";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/header";

export default function SignIn() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { signIn, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Get redirect URL from query params
  const params = new URLSearchParams(globalThis.location.search);
  const redirectUrl = params.get('redirect') || '/';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectUrl);
    }
  }, [isAuthenticated, navigate, redirectUrl]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!email || !password) {
      setError("Por favor, preencha todos os campos");
      setIsLoading(false);
      return;
    }

    try {
      await signIn({ email, password });

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao CodeQuest!",
        className: "bg-green-50 text-green-900 border-green-200",
      });

      navigate(redirectUrl);
    } catch (error: any) {
      let errorMessage = "Erro ao fazer login. Tente novamente.";

      if (error.message?.includes("auth/invalid-credential")) {
        errorMessage = "Email ou senha incorretos. Verifique suas credenciais.";
      } else if (error.message?.includes("auth/user-not-found")) {
        errorMessage = "Usuário não encontrado. Verifique o email digitado.";
      } else if (error.message?.includes("auth/wrong-password")) {
        errorMessage = "Senha incorreta. Tente novamente.";
      } else if (error.message?.includes("auth/invalid-email")) {
        errorMessage = "Email inválido. Verifique o formato do email.";
      } else if (error.message?.includes("auth/user-disabled")) {
        errorMessage = "Esta conta foi desativada. Entre em contato com o suporte.";
      } else if (error.message?.includes("auth/too-many-requests")) {
        errorMessage = "Muitas tentativas de login. Tente novamente mais tarde.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFirstAccess = () => {
    navigate("/auth/signup");
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <div className="flex items-center justify-center p-4 pt-20">
        <GlowCard glowColor="purple" customSize={true} className="w-full max-w-2xl">
          <CardHeader className="space-y-2 text-center">
            <h1 className="text-2xl font-bold" style={{ color: "#fff6e9", fontFamily: "var(--font-retro)" }}>
              Entrar no CodeQuest
            </h1>
            <CardDescription className="text-lg" style={{ color: "#fff6e9", opacity: 0.9 }}>
              Faça login para continuar sua jornada de aprendizado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <section
              className="rounded-xl border p-5"
              style={{
                background: "linear-gradient(180deg, rgba(8, 13, 18, 0.95) 0%, rgba(9, 24, 18, 0.85) 100%)",
                borderColor: "rgba(157, 78, 221, 0.65)",
                boxShadow: "0 0 24px rgba(16, 185, 129, 0.14)",
              }}
            >
              <p
                className="text-xl font-semibold mb-4"
                style={{ color: "#00e5b3", fontFamily: "var(--font-retro)" }}
              >
                Aluno da formação? Comece por aqui.
              </p>
              <p className="mt-2 text-lg" style={{ color: "#fff6e9", opacity: 0.9 }}>
                No primeiro acesso, ative sua conta antes de entrar com e-mail e senha.
              </p>
              <Button type="button" onClick={handleFirstAccess} className="mt-5 w-full rpg-button">
                <GraduationCap className="mr-2 h-4 w-4" />
                Primeiro acesso de aluno
              </Button>
            </section>

            {error && (
              <Alert
                variant="destructive"
                style={{
                  backgroundColor: error.includes("Email ou senha incorretos") ? "white" : undefined,
                  borderColor: error.includes("Email ou senha incorretos") ? "#ef4444" : undefined,
                }}
              >
                <AlertDescription
                  style={{
                    color: error.includes("Email ou senha incorretos") ? "#ef4444" : undefined,
                    fontWeight: error.includes("Email ou senha incorretos") ? "500" : undefined,
                  }}
                >
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">

                  <Input
                    id="email"
                    type="email"
                    placeholder="Digite seu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-8bit"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-8bit"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full rpg-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>

            <div className="text-center">
              <Link href="/auth/forgot-password">
                <span className="text-sm font-medium hover:underline" style={{ color: "#9d4edd" }}>
                  Esqueci minha senha
                </span>
              </Link>
            </div>

            <div className="text-center text-sm">
              <span style={{ color: "#fff6e9", opacity: 0.8 }}>Não tem uma conta? </span>
              <Link href="/auth/signup">
                <span className="font-medium" style={{ color: "#9d4edd" }}>
                  Cadastre-se
                </span>
              </Link>
            </div>
          </CardContent>
        </GlowCard>
      </div>
    </div>
  );
}