import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlowCard } from "@/components/ui/spotlight-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Loader2, Mail, Lock, User, Chrome, MessageCircle } from "lucide-react";
import { useAuth } from "../../lib/simple-auth-client";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/header";

export default function SignUp() {
  const [, navigate] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingEmail, setIsValidatingEmail] = useState(false);
  const [error, setError] = useState("");
  const [emailValidated, setEmailValidated] = useState(false);
  const [showRegistrationFields, setShowRegistrationFields] = useState(false);
  const { signUp, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const validateEmail = async () => {
    if (!email) {
      setError("Por favor, digite seu email do DevQuest");
      return;
    }

    setIsValidatingEmail(true);
    setError("");

    try {
      const response = await fetch("/api/auth/validate-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (result.userExists) {
        // User already has an account
        setError(result.message);
        setEmailValidated(false);
        setShowRegistrationFields(false);
      } else if (result.isValid) {
        setEmailValidated(true);
        setShowRegistrationFields(true);
        setError("");
        toast({
          title: "Email válido!",
          description: result.message,
          className: "bg-green-50 text-green-900 border-green-200",
        });
      } else {
        setError(result.message);
        setEmailValidated(false);
        setShowRegistrationFields(false);
      }
    } catch (error) {
      setError("Erro ao validar email. Tente novamente.");
    } finally {
      setIsValidatingEmail(false);
    }
  };

  // Removed handleEmailBlur - validation only on button click

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // First validate email if not validated yet
    if (!emailValidated) {
      await validateEmail();
      return;
    }

    // If email is not valid, don't proceed
    if (!emailValidated) {
      return;
    }

    setIsLoading(true);
    setError("");

    // Validate all required fields
    if (!name || !email || !password || !confirmPassword) {
      setError("Por favor, preencha todos os campos");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres");
      setIsLoading(false);
      return;
    }

    try {
      await signUp({ email, password, name });
      
      toast({
        title: "Conta criada com sucesso!",
        description: "Bem-vindo ao CodeQuest! Comece sua jornada de aprendizado.",
        className: "bg-green-50 text-green-900 border-green-200",
      });
      
      navigate("/");
    } catch (error: any) {
      let errorMessage = "Erro ao criar conta. Tente novamente.";
      
      if (error.message?.includes("auth/email-already-in-use")) {
        errorMessage = "Este email já está em uso. Tente fazer login ou use outro email.";
      } else if (error.message?.includes("auth/weak-password")) {
        errorMessage = "Senha muito fraca. Use pelo menos 6 caracteres.";
      } else if (error.message?.includes("auth/invalid-email")) {
        errorMessage = "Email inválido. Verifique o formato do email.";
      } else if (error.message?.includes("auth/operation-not-allowed")) {
        errorMessage = "Cadastro por email não permitido. Entre em contato com o suporte.";
      } else if (error.message?.includes("auth/too-many-requests")) {
        errorMessage = "Muitas tentativas de cadastro. Tente novamente mais tarde.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <div className="flex items-center justify-center p-4 pt-20">
        <GlowCard glowColor="purple" customSize={true} className="w-full max-w-2xl">
        <CardHeader className="space-y-1 text-center">
          <h1 className="text-2xl font-bold" style={{ color: '#fff6e9', fontFamily: 'var(--font-retro)' }}>
            Criar Conta
          </h1>
          <CardDescription style={{ color: '#fff6e9', opacity: 0.8 }}>
            Parábens! Você recebeu acesso antecipado ao CodeQuest! Para acessar, basta criar sua conta com o mesmo email usado no DevQuest
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <>
              <Alert 
                variant="destructive" 
                style={{ 
                  backgroundColor: error.includes("não está cadastrado") ? 'white' : 
                                  error.includes("já possui uma conta") ? '#dbeafe' : undefined,
                  borderColor: error.includes("não está cadastrado") ? '#ef4444' : 
                               error.includes("já possui uma conta") ? '#3b82f6' : undefined
                }}
              >
                <AlertDescription 
                  style={{ 
                    color: error.includes("não está cadastrado") ? '#ef4444' : 
                          error.includes("já possui uma conta") ? '#1e40af' : undefined,
                    fontWeight: error.includes("não está cadastrado") || error.includes("já possui uma conta") ? '500' : undefined
                  }}
                >
                  {error}
                </AlertDescription>
              </Alert>
              
              {/* WhatsApp Support Button - Show when email is not in database */}
              {error.includes("não está cadastrado") && (
                <Button
                  onClick={() => window.open("http://wa.me/555197034968", "_blank")}
                  className="w-full bg-green-600 hover:bg-green-700 text-white transition-colors"
                  variant="outline"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Contatar Suporte no WhatsApp
                </Button>
              )}
              
              {/* Login Button - Show when user already exists */}
              {error.includes("já possui uma conta") && (
                <Button
                  onClick={() => navigate("/auth/signin")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                  variant="outline"
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Ir para Login
                </Button>
              )}
            </>
          )}

          <form onSubmit={handleEmailSignUp} className="space-y-4">
            {/* Email field - always visible */}
            <div className="space-y-2">
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="Qual seu email do DevQuest?"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailValidated(false);
                    setShowRegistrationFields(false);
                    setError("");
                  }}
                  className="input-8bit"
                  disabled={isLoading || isValidatingEmail}
                  required
                />
                {isValidatingEmail && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin" style={{ color: '#9d4edd' }} />
                  </div>
                )}
              </div>
            </div>

            {/* Registration fields - show only after email validation */}
            {emailValidated && showRegistrationFields && (
              <>
                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      id="name"
                      type="text"
                      placeholder="Seu nome completo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
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
                      placeholder="Crie uma senha (mínimo 8 caracteres)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-8bit"
                      disabled={isLoading}
                      required
                      minLength={8}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirme sua senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input-8bit"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <Button
              type="submit"
              className="w-full rpg-button"
              disabled={isLoading || isValidatingEmail}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                <>
                  {!emailValidated ? "Validar Email" : "Criar Conta"}
                </>
              )}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span style={{ color: '#fff6e9', opacity: 0.8 }}>Já tem uma conta? </span>
            <Link href="/auth/signin">
              <span className="font-medium" style={{ color: '#9d4edd' }}>
                Faça login
              </span>
            </Link>
          </div>
        </CardContent>
        </GlowCard>
      </div>
    </div>
  );
}