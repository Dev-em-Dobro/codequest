import { useParams } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { ExerciseSidebar } from "@/components/exercise-sidebar";
import { CodeEditor } from "@/components/code-editor";
import { LivePreview } from "@/components/live-preview";
import { TipsModal } from "@/components/tips-modal";
import AuthGuard from "@/components/auth-guard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GlowCard } from "@/components/ui/spotlight-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Code2, Monitor, Trophy, Gem, ChevronRight, Sparkles } from "lucide-react";
import { useState, useCallback, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/simple-auth-client";
import { Link } from "wouter";
import { queryKeys } from "@/lib/queryKeys";

export default function ExerciseDetail() {
  return (
    <AuthGuard>
      <ExerciseDetailContent />
    </AuthGuard>
  );
}

function ExerciseDetailContent() {
  const params = useParams();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const currentExerciseId = params.id || "3"; // Default to exercise 3 as shown in design
  const [showTips, setShowTips] = useState(false);
  const [currentCode, setCurrentCode] = useState({
    html: "",
    css: "",
    javascript: ""
  });
  const [lastPersistedCode, setLastPersistedCode] = useState({
    html: "",
    css: "",
    javascript: ""
  });
  const [isAiReviewing, setIsAiReviewing] = useState(false);
  const [isGettingHint, setIsGettingHint] = useState(false);
  const [aiReview, setAiReview] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getSessionId = useCallback(() => {
    const authState = (globalThis as any).__authClient?.getState?.();
    return authState?.sessionId || localStorage.getItem("codequest_session_id");
  }, []);

  // Memoized query keys for stable references
  const exerciseQueryKey = useMemo(() =>
    queryKeys.exerciseById(currentExerciseId),
    [currentExerciseId]
  );
  const progressQueryKey = useMemo(() =>
    queryKeys.progressById(currentExerciseId),
    [currentExerciseId]
  );

  const { data: exercise, isLoading: exerciseLoading } = useQuery({
    queryKey: exerciseQueryKey,
    enabled: !!currentExerciseId && !!isAuthenticated && !authLoading,
    staleTime: 5 * 60 * 1000, // 5 minutes - exercises don't change often
    gcTime: 15 * 60 * 1000, // 15 minutes
    select: (data) => {
      if (!data) return null;
      // Select only needed fields to reduce memory usage
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        instructions: data.instructions,
        difficulty: data.difficulty,
        category: data.category,
        points: data.points,
        order: data.order,
        hints: data.hints,
        initialCode: data.initialCode
      };
    },
    placeholderData: null,
  });

  const { data: progress, refetch: refetchProgress, isLoading: progressLoading } = useQuery({
    queryKey: progressQueryKey,
    enabled: !!currentExerciseId && !!isAuthenticated && !authLoading,
    staleTime: 30 * 1000, // 30 seconds - progress changes frequently
    gcTime: 2 * 60 * 1000, // 2 minutes
    select: (data) => {
      if (!data) return null;
      // Select only needed fields
      return {
        exerciseId: data.exerciseId,
        completed: data.completed,
        userCode: data.userCode,
        pointsEarned: data.pointsEarned
      };
    },
    placeholderData: null,
  });

  const handleCodeChange = useCallback((code: { html: string; css: string; javascript: string }) => {
    setCurrentCode(code);
  }, []);

  const normalizeCode = useCallback((code: any) => ({
    html: typeof code?.html === "string" ? code.html : "",
    css: typeof code?.css === "string" ? code.css : "",
    javascript: typeof code?.javascript === "string" ? code.javascript : ""
  }), []);

  const codeChanged = useCallback((a: any, b: any) => {
    const codeA = normalizeCode(a);
    const codeB = normalizeCode(b);

    return codeA.html !== codeB.html || codeA.css !== codeB.css || codeA.javascript !== codeB.javascript;
  }, [normalizeCode]);

  const hasCodeContent = useCallback((code: any) => {
    const normalized = normalizeCode(code);
    return Boolean(normalized.html.trim() || normalized.css.trim() || normalized.javascript.trim());
  }, [normalizeCode]);

  const saveCodeIfNeeded = useCallback(async (headers: HeadersInit) => {
    const normalizedCurrentCode = normalizeCode(currentCode);

    if (!hasCodeContent(normalizedCurrentCode)) {
      return;
    }

    if (!codeChanged(normalizedCurrentCode, lastPersistedCode)) {
      return;
    }

    await fetch("/api/code/save", {
      method: "POST",
      headers,
      body: JSON.stringify({
        exerciseId: currentExerciseId,
        userCode: normalizedCurrentCode
      })
    });

    setLastPersistedCode(normalizedCurrentCode);
  }, [currentCode, hasCodeContent, codeChanged, lastPersistedCode, currentExerciseId, normalizeCode]);

  const handleExecute = async () => {
    if (!exercise || !currentExerciseId) return;

    try {
      // Get auth token for API calls
      const sessionId = getSessionId();
      const headers: HeadersInit = { "Content-Type": "application/json" };

      if (sessionId) {
        headers.Authorization = `Bearer ${sessionId}`;
      }

      // Save only when code changed to reduce unnecessary writes
      try {
        await saveCodeIfNeeded(headers);
      } catch (saveError) {
        console.warn("Failed to save code before validation:", saveError);
        // Continue with validation even if save fails
      }

      const response = await fetch(`/api/exercises/${currentExerciseId}/validate`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          userCode: currentCode
        })
      });

      const result = await response.json();

      // Show JavaScript output if present
      if (result.jsOutput) {
        toast({
          title: "Saída do JavaScript",
          description: result.jsOutput,
          duration: 5000,
        });
      }

      if (result.isValid) {
        // Check if exercise was already completed
        const isAlreadyCompleted = (progress as any)?.completed;

        if (!isAlreadyCompleted) {
          console.log("🔐 Auth state for normal validation:", { sessionId });
          console.log("Completing exercise");
          // Complete the exercise with authentication (first time)
          const completeResponse = await fetch(`/api/exercises/${currentExerciseId}/complete`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(sessionId && { Authorization: `Bearer ${sessionId}` })
            },
            body: JSON.stringify({
              userCode: currentCode
            })
          });
          console.log("📡 Normal complete response status:", completeResponse.status);

          if (!completeResponse.ok) {
            console.error("Failed to mark exercise as complete:", completeResponse.status);
            toast({
              title: "Erro ao salvar progresso",
              description: "O exercício foi validado mas houve erro ao salvar. Tente novamente.",
              variant: "destructive",
            });
            return;
          }

          toast({
            title: "Parabéns! 🎉",
            description: `Exercício concluído! Você ganhou ${(exercise as any)?.points || 10} pontos. (${Math.round(result.overallScore)}% de precisão)`,
            className: "bg-success text-success-foreground border-success",
          });
          // Surgical invalidation - only invalidate specific data
          queryClient.invalidateQueries({ queryKey: queryKeys.user() });
          queryClient.invalidateQueries({ queryKey: queryKeys.progressById(currentExerciseId) });
        } else {
          // Exercise already completed, just show validation success
          toast({
            title: "Código correto! ✅",
            description: `Exercício validado com sucesso! (${Math.round(result.overallScore)}% de precisão)`,
            className: "bg-success text-success-foreground border-success",
          });
        }
        refetchProgress();
        queryClient.invalidateQueries({ queryKey: queryKeys.progress() });
      } else {
        // Find the most relevant validation error
        const failedValidations = result.results.filter((r: any) => !r.isValid);
        if (failedValidations.length > 0) {
          const mainError = failedValidations[0];
          toast({
            title: `${Math.round(result.overallScore)}% correto`,
            description: mainError.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Validação incompleta",
            description: `Código ${Math.round(result.overallScore)}% correto. Continue melhorando!`,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Validation error:", error);
      toast({
        title: "Erro",
        description: "Erro ao validar o código. Tente novamente.",
        variant: "destructive",
      });
    }
  };
  // Set initial code when exercise or progress loads
  useEffect(() => {
    if ((progress as any)?.userCode) {
      // User has saved code, use that
      const persistedCode = normalizeCode((progress as any).userCode);
      setCurrentCode(persistedCode);
      setLastPersistedCode(persistedCode);
    } else if ((exercise as any)?.initialCode) {
      // Use exercise's initial template
      const initialCode = normalizeCode((exercise as any).initialCode);
      setCurrentCode(initialCode);
      setLastPersistedCode(initialCode);
    } else if (exercise && !progressLoading) {
      // Fallback to empty structure
      const emptyCode = {
        html: "",
        css: "",
        javascript: ""
      };
      setCurrentCode(emptyCode);
      setLastPersistedCode(emptyCode);
    }
  }, [progress, exercise, progressLoading, normalizeCode]);

  // AI Review function
  const handleAiReview = async () => {
    setIsAiReviewing(true);
    try {
      // Get auth token the same way as handleExecute
      const sessionId = getSessionId();
      const headers: any = {
        "Content-Type": "application/json"
      };

      if (sessionId) {
        headers.Authorization = `Bearer ${sessionId}`;
      }

      // Save only when code changed to reduce unnecessary writes
      try {
        await saveCodeIfNeeded(headers);
      } catch (saveError) {
        console.warn("Failed to save code before AI review:", saveError);
        // Continue with AI review even if save fails
      }

      const response = await fetch(`/api/exercises/${currentExerciseId}/ai-review`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          userCode: currentCode
        })
      });

      const result = await response.json();
      setAiReview(result);

      // Se a IA determinar que está correto (score >= 100), marca como concluído
      if (result.isCorrect && result.score >= 100) {
        // Check if exercise was already completed
        const isAlreadyCompleted = (progress as any)?.completed;

        if (!isAlreadyCompleted) {
          console.log("🔐 Auth state for complete:", { sessionId });
          // Complete the exercise with authentication (first time)
          const completeResponse = await fetch(`/api/exercises/${currentExerciseId}/complete`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(sessionId && { Authorization: `Bearer ${sessionId}` })
            },
            body: JSON.stringify({
              userCode: currentCode
            })
          });
          console.log("📡 Complete response status:", completeResponse.status);

          if (!completeResponse.ok) {
            console.error("Failed to mark exercise as complete:", completeResponse.status);
            toast({
              title: "Erro ao salvar progresso",
              description: "O exercício foi validado mas houve erro ao salvar. Tente novamente.",
              variant: "destructive",
            });
            return;
          }

          toast({
            title: "Parabéns! 🎉",
            description: `Exercício concluído! A IA validou seu código. Você ganhou ${(exercise as any)?.points || 10} pontos!`,
            className: "bg-success text-success-foreground border-success",
            duration: 8000,
          });

          // Surgical invalidation - only invalidate specific data  
          queryClient.invalidateQueries({ queryKey: queryKeys.user() });
          queryClient.invalidateQueries({ queryKey: queryKeys.progressById(currentExerciseId) });
          queryClient.invalidateQueries({ queryKey: queryKeys.progress() });
          refetchProgress();
        } else {
          toast({
            title: "✅ Código correto!",
            description: "Este exercício já foi concluído anteriormente. " + result.feedback,
            duration: 8000,
          });
        }
      } else {
        // Código não está 100% correto, mostra feedback
        toast({
          title: "💡 Feedback da IA",
          description: result.feedback + " (Sugestões: " + result.suggestions.join("\n• ") + ")",
          duration: 10000,
        });

        // Se tiver sugestões, mostra em um toast adicional
        // if (result.suggestions && result.suggestions.length > 0) {
        //   setTimeout(() => {
        //     toast({
        //       title: "📝 Sugestões de melhoria",
        //       description: result.suggestions.join("\n• "),
        //       duration: 12000,
        //     });
        //   }, 2000);
        // }
      }

    } catch (error) {
      toast({
        title: "Erro na análise",
        description: "Não foi possível analisar seu código. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsAiReviewing(false);
    }
  };

  // AI Hint function
  const handleAiHint = async () => {
    setIsGettingHint(true);
    try {
      // Get auth token the same way as handleExecute
      const sessionId = getSessionId();
      const headers: any = {
        "Content-Type": "application/json"
      };

      if (sessionId) {
        headers.Authorization = `Bearer ${sessionId}`;
      }

      const response = await fetch(`/api/exercises/${currentExerciseId}/ai-hint`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          userCode: currentCode
        })
      });

      const result = await response.json();

      toast({
        title: "💡 Dica da IA",
        description: result.hint,
        duration: 10000,
      });

    } catch (error) {
      toast({
        title: "Erro ao buscar dica",
        description: "Não foi possível gerar uma dica. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGettingHint(false);
    }
  };

  if (exerciseLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex h-screen pt-16" style={{ marginTop: '64px' }}>
          <ExerciseSidebar currentExerciseId={currentExerciseId} />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando exercício...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex h-screen pt-16" style={{ marginTop: '64px' }}>
          <ExerciseSidebar currentExerciseId={currentExerciseId} />
          <main className="flex-1 flex items-center justify-center">
            <Card className="w-full max-w-md mx-4">
              <CardContent className="pt-6 text-center">
                <h2 className="text-xl font-semibold mb-2">Exercício não encontrado</h2>
                <p className="text-muted-foreground">
                  Selecione um exercício da barra lateral para começar.
                </p>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />

      {/* Breadcrumb Navigation - following the same style as exercises pages */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link href="/" className="flex items-center text-slate-400 hover:text-purple-400 transition-colors">
                Início
              </Link>
            </li>
            <ChevronRight className="w-4 h-4 text-slate-600" />
            <li>
              <Link href={`/exercises/${(exercise as any)?.category}`} className="text-slate-400 hover:text-purple-400 transition-colors capitalize">
                Exercícios {(exercise as any)?.category?.toUpperCase()}
              </Link>
            </li>
            <ChevronRight className="w-4 h-4 text-slate-600" />
            <li>
              <span className="text-purple-400 font-medium">{(exercise as any)?.title}</span>
            </li>
          </ol>
        </nav>
      </div>

      <div className="flex h-screen">
        <ExerciseSidebar currentExerciseId={currentExerciseId} />

        <main className="flex-1 flex flex-col p-6 gap-6">

          {/* Exercise Overview Card */}
          <Card className="shadow-lg border-0 bg-gradient-to-r from-white to-slate-50">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">

                  <div>
                    <CardTitle className="text-2xl font-bold text-slate-900">
                      {(exercise as any)?.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1">

                        Exercício {(exercise as any)?.order}
                      </span>

                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="capitalize font-semibold">

                    Nível {(exercise as any)?.difficulty}
                  </Badge>
                  <span className="flex items-center gap-1 text-amber-600">
                    <Gem className="w-4 h-4" />
                    {(exercise as any)?.points} pontos
                  </span>

                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Exercise Instructions */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-blue-900 flex items-center gap-2">
                    📝 Instruções do Exercício
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-blue-800 mb-3 leading-relaxed">{(exercise as any)?.instructions}</p>

                  {/* Instrução especial para exercícios JavaScript */}
                  {(exercise as any)?.category?.toLowerCase() === 'javascript' && (
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-3">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-yellow-700 font-medium">
                            <strong>📱 Importante para JavaScript:</strong> Quando executar o código, abra o DevTools do seu navegador usando <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">F12</kbd> e visualize a execução do seu código na aba <strong>Console</strong>.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* <div className="text-sm text-blue-700 bg-white/50 p-3 rounded-lg">
                    <p>{(exercise as any)?.description}</p>
                  </div> */}
                </CardContent>
              </Card>

              {/* Progress Indicator */}
              {(progress as any)?.completed && (
                <Card className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-100">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3 text-green-700">
                      <div className="p-2 bg-green-100 rounded-full">
                        <Trophy className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold">Exercício Concluído!</p>
                        <p className="text-sm text-green-600">Você ganhou {(exercise as any)?.points} pontos</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-4">
                <Button
                  size="sm"
                  onClick={() => setShowTips(true)}
                  className="rpg-button"
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Dicas
                </Button>

              </div>
            </CardContent>

          </Card>

          {/* Code Editor and Preview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
            {/* Code Editor GlowCard */}
            <GlowCard
              glowColor="blue"
              customSize={true}
              className="flex flex-col min-h-[500px]"
            >
              <div className="flex flex-col h-full overflow-hidden">
                <div className="pb-3 mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                    <Code2 className="w-5 h-5" />
                    Editor de Código
                  </h3>
                  <p className="text-slate-300 text-sm">
                    Escreva seu código abaixo
                  </p>
                </div>
                <div className="flex-1 bg-black/20 rounded-lg overflow-hidden">
                  {progressLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-4"></div>
                        <p className="text-slate-300 text-sm">Carregando seu código...</p>
                      </div>
                    </div>
                  ) : (
                    <CodeEditor
                      key={currentExerciseId}
                      initialCode={currentCode}
                      onChange={handleCodeChange}
                      exerciseCategory={(exercise as any)?.category}
                    />
                  )}
                </div>
              </div>
            </GlowCard>

            {/* Live Preview GlowCard */}
            <GlowCard
              glowColor="purple"
              customSize={true}
              className="flex flex-col min-h-[500px]"
            >
              <div className="flex flex-col h-full">
                <div className="pb-3 mb-4">
                  <div className="mb-3">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                      <Monitor className="w-5 h-5" />
                      Visualização
                    </h3>
                    <p className="text-slate-300 text-sm">
                      Veja o resultado do seu código em tempo real
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {/* <Button
                      onClick={handleExecute}
                      size="sm"
                      className="rpg-button"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Enviar pra correção
                    </Button> */}

                    <Button
                      onClick={handleAiReview}
                      size="sm"

                      disabled={isAiReviewing}
                      className="rpg-button"
                    >
                      {isAiReviewing ? (
                        <div className="w-4 h-4 mr-2 animate-spin border-2 border-purple-400 border-t-transparent rounded-full" />
                      ) : (
                        <Sparkles className="w-4 h-4 mr-2" />
                      )}
                      {isAiReviewing ? "Analisando..." : "Enviar para correção"}
                    </Button>

                    {/* <Button
                      onClick={handleAiHint}
                      size="sm"
                      variant="outline"
                      disabled={isGettingHint}
                      className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
                    >
                      {isGettingHint ? (
                        <div className="w-4 h-4 mr-2 animate-spin border-2 border-blue-400 border-t-transparent rounded-full" />
                      ) : (
                        <MessageCircle className="w-4 h-4 mr-2" />
                      )}
                      {isGettingHint ? "Gerando dica..." : "Pedir Dica"}
                    </Button> */}
                  </div>
                </div>
                <div className="flex-1 bg-black/20 rounded-lg overflow-hidden">
                  <LivePreview
                    code={currentCode}
                    autoExecuteJS={false}
                    onJSOutput={(output) => {
                      console.log("JavaScript output:", output);
                    }}
                  />
                </div>
              </div>
            </GlowCard>
          </div>

          {/* Progress Card - Bottom */}
          {/* <div className="mt-6">
            <GlowCard 
              glowColor="green" 
              customSize={true}
              className="flex flex-col"
            >
              <div className="flex flex-col h-full">
                <div className="pb-3 mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                    <Trophy className="w-5 h-5" />
                    Progresso
                  </h3>
                  <p className="text-slate-300 text-sm">
                    Acompanhe seu desenvolvimento
                  </p>
                </div>
                <div className="flex flex-row gap-4">
                  {(progress as any)?.completed ? (
                    <div className="bg-green-500/20 p-4 rounded-lg border border-green-400/30 flex-1">
                      <div className="flex items-center gap-3 text-green-300">
                        <Trophy className="w-6 h-6" />
                        <div>
                          <p className="font-semibold">Exercício Concluído!</p>
                          <p className="text-sm">+{(exercise as any)?.points} pontos</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-500/20 p-4 rounded-lg border border-yellow-400/30 flex-1">
                      <div className="flex items-center gap-3 text-yellow-300">
                        <Zap className="w-6 h-6" />
                        <div>
                          <p className="font-semibold">Em Progresso</p>
                          <p className="text-sm">Complete para ganhar {(exercise as any)?.points} pontos</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-500/20 p-4 rounded-lg border border-blue-400/30 flex-1">
                    <h4 className="font-semibold text-blue-300 mb-2 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Dicas Disponíveis
                    </h4>
                    <Button
                      onClick={() => setShowTips(true)}
                      size="sm"
                      className="w-full rpg-button"
                    >
                      Ver Dicas
                    </Button>
                  </div>
                </div>
              </div>
            </GlowCard>
          </div> */}
        </main>
      </div>

      <TipsModal
        open={showTips}
        onOpenChange={setShowTips}
        hints={(exercise as any)?.hints || []}
      />
    </div>
  );
}