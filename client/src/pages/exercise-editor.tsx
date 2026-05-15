import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { 
  Code, 
  Play, 
  RotateCcw, 
  Lightbulb, 
  CheckCircle2, 
  XCircle,
  ArrowLeft,
  Trophy,
  Star,
  Gem
} from "lucide-react";
import { Header } from "@/components/header";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface Exercise {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  points: number;
  instructions: string;
  hints: string[];
  starterCode: {
    html: string;
    css: string;
    javascript: string;
  };
  solution: {
    html: string;
    css: string;
    javascript: string;
  };
  validation: {
    type: "output" | "element" | "style" | "function";
    target?: string;
    expected?: string;
    contains?: string[];
  };
}

export default function ExerciseEditor() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get exercise ID from URL
  const exerciseId = new URLSearchParams(window.location.search).get('id') || "1";
  
  // Code states
  const [htmlCode, setHtmlCode] = useState("");
  const [cssCode, setCssCode] = useState("");
  const [jsCode, setJsCode] = useState("");
  const [currentHint, setCurrentHint] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  // Fetch exercise data
  const { data: exercise, isLoading } = useQuery<Exercise>({
    queryKey: [`/api/exercises/${exerciseId}`],
    staleTime: 15 * 60 * 1000, // 15 minutos - exercícios mudam pouco
  });

  // Check if user has completed this exercise
  const { data: progress } = useQuery({
    queryKey: ['/api/progress'],
    staleTime: 2 * 60 * 1000,
    enabled: !!user,
  });

  // Initialize code with starter code
  useEffect(() => {
    if (exercise && !isCompleted) {
      setHtmlCode(exercise.starterCode.html);
      setCssCode(exercise.starterCode.css);
      setJsCode(exercise.starterCode.javascript);
    }
  }, [exercise, isCompleted]);

  // Check if exercise is already completed
  useEffect(() => {
    if (progress && exerciseId) {
      const isAlreadyCompleted = progress.some((p: any) => 
        p.exerciseId === exerciseId && p.completed
      );
      setIsCompleted(isAlreadyCompleted);
    }
  }, [progress, exerciseId]);

  // Save progress mutation
  const saveProgressMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/progress', {
      method: 'POST',
      body: data
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/progress'] });
    }
  });

  const generatePreview = () => {
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Preview</title>
        <style>
          body { margin: 0; padding: 20px; font-family: system-ui, sans-serif; }
          ${cssCode}
        </style>
      </head>
      <body>
        ${htmlCode}
        <script>
          try {
            ${jsCode}
          } catch (error) {
            console.error('JavaScript Error:', error);
            document.body.innerHTML += '<div style="color: red; background: #fee; padding: 10px; border: 1px solid red; margin: 10px 0;">Erro no JavaScript: ' + error.message + '</div>';
          }
        </script>
      </body>
      </html>
    `;
  };

  const runCode = () => {
    setPreviewKey(prev => prev + 1);
  };

  const resetCode = () => {
    if (exercise) {
      setHtmlCode(exercise.starterCode.html);
      setCssCode(exercise.starterCode.css);
      setJsCode(exercise.starterCode.javascript);
      setCurrentHint(0);
      setPreviewKey(prev => prev + 1);
    }
  };

  const showHint = () => {
    if (exercise && currentHint < exercise.hints.length) {
      setCurrentHint(currentHint + 1);
      toast({
        title: `Dica ${currentHint + 1}`,
        description: exercise.hints[currentHint],
      });
    }
  };

  const validateSolution = () => {
    if (!exercise) return false;

    // Simple validation based on the exercise requirements
    switch (exercise.validation.type) {
      case "element":
        return htmlCode.toLowerCase().includes(exercise.validation.target?.toLowerCase() || "");
      case "style":
        return cssCode.toLowerCase().includes(exercise.validation.target?.toLowerCase() || "");
      case "output":
        return exercise.validation.contains?.every(text => 
          htmlCode.toLowerCase().includes(text.toLowerCase()) ||
          cssCode.toLowerCase().includes(text.toLowerCase()) ||
          jsCode.toLowerCase().includes(text.toLowerCase())
        ) || false;
      default:
        return true;
    }
  };

  const submitSolution = async () => {
    if (!user || !exercise) return;

    const isValid = validateSolution();
    
    if (isValid) {
      // Check if already completed
      if (!isCompleted) {
        try {
          await saveProgressMutation.mutateAsync({
            exerciseId,
            completed: true,
            code: {
              html: htmlCode,
              css: cssCode,
              javascript: jsCode
            },
            pointsEarned: exercise.points
          });

          setIsCompleted(true);
          toast({
            title: "🎉 Parabéns!",
            description: `Você completou o exercício e ganhou ${exercise.points} pontos!`,
          });
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Erro",
            description: "Não foi possível salvar o progresso. Tente novamente.",
          });
        }
      } else {
        // Already completed, just validate
        toast({
          title: "✅ Código correto!",
          description: "Exercício validado com sucesso!",
        });
      }
    } else {
      toast({
        variant: "destructive",
        title: "Exercício incompleto",
        description: "Sua solução ainda não atende aos requisitos. Verifique as instruções!",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Carregando exercício...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center pt-20">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center">
              <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Exercício não encontrado</h2>
              <p className="text-gray-600 mb-4">O exercício solicitado não existe.</p>
              <Button onClick={() => navigate("/")}>
                Voltar aos exercícios
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const difficultyColors = {
    beginner: "bg-green-100 text-green-800",
    intermediate: "bg-yellow-100 text-yellow-800", 
    advanced: "bg-red-100 text-red-800"
  };

  const difficultyLabels = {
    beginner: "Iniciante",
    intermediate: "Intermediário",
    advanced: "Avançado"
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Início</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/exercises">Exercícios</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/exercises/${exercise.category}`}>
                  {exercise.category.toUpperCase()}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{exercise.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{exercise.title}</h1>
                  {isCompleted && (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Concluído
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={difficultyColors[exercise.difficulty]}>
                    {difficultyLabels[exercise.difficulty]}
                  </Badge>
                  <Badge variant="outline">
                    <Gem className="w-3 h-3 mr-1" />
                    {exercise.points} pontos
                  </Badge>
                  <Badge variant="outline">{exercise.category}</Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={showHint} disabled={currentHint >= exercise.hints.length}>
                <Lightbulb className="w-4 h-4 mr-2" />
                Dica {currentHint < exercise.hints.length ? `(${currentHint + 1}/${exercise.hints.length})` : '(esgotadas)'}
              </Button>
              <Button variant="outline" onClick={resetCode}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Resetar
              </Button>
              <Button onClick={runCode} variant="outline">
                <Play className="w-4 h-4 mr-2" />
                Executar
              </Button>
              {!isCompleted && (
                <Button onClick={submitSolution} className="bg-green-600 hover:bg-green-700">
                  <Trophy className="w-4 h-4 mr-2" />
                  Enviar Solução
                </Button>
              )}
            </div>
          </div>
        </div>

        <ResizablePanelGroup direction="horizontal" className="h-[calc(100vh-200px)]">
          {/* Instructions Panel */}
          <ResizablePanel defaultSize={30} minSize={25}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">Instruções</CardTitle>
                <CardDescription>{exercise.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose prose-sm max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: exercise.instructions }} />
                </div>
                
                {currentHint > 0 && (
                  <Alert>
                    <Lightbulb className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Dicas usadas:</strong>
                      <ul className="mt-2 space-y-1">
                        {exercise.hints.slice(0, currentHint).map((hint, index) => (
                          <li key={index} className="text-sm">• {hint}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </ResizablePanel>

          <ResizableHandle />

          {/* Code Editor Panel */}
          <ResizablePanel defaultSize={40} minSize={30}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Code className="w-5 h-5 mr-2" />
                  Editor de Código
                </CardTitle>
              </CardHeader>
              <CardContent className="h-full pb-2">
                <Tabs defaultValue="html" className="h-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="html">HTML</TabsTrigger>
                    <TabsTrigger value="css">CSS</TabsTrigger>
                    <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="html" className="h-[calc(100%-40px)]">
                    <textarea
                      value={htmlCode}
                      onChange={(e) => setHtmlCode(e.target.value)}
                      className="w-full h-full p-4 font-mono text-sm border rounded-md resize-none"
                      placeholder="Digite seu código HTML aqui..."
                      spellCheck={false}
                    />
                  </TabsContent>
                  
                  <TabsContent value="css" className="h-[calc(100%-40px)]">
                    <textarea
                      value={cssCode}
                      onChange={(e) => setCssCode(e.target.value)}
                      className="w-full h-full p-4 font-mono text-sm border rounded-md resize-none"
                      placeholder="Digite seu código CSS aqui..."
                      spellCheck={false}
                    />
                  </TabsContent>
                  
                  <TabsContent value="javascript" className="h-[calc(100%-40px)]">
                    <textarea
                      value={jsCode}
                      onChange={(e) => setJsCode(e.target.value)}
                      className="w-full h-full p-4 font-mono text-sm border rounded-md resize-none"
                      placeholder="Digite seu código JavaScript aqui..."
                      spellCheck={false}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </ResizablePanel>

          <ResizableHandle />

          {/* Preview Panel */}
          <ResizablePanel defaultSize={30} minSize={25}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">Preview</CardTitle>
                <CardDescription>Resultado do seu código</CardDescription>
              </CardHeader>
              <CardContent className="h-full pb-2">
                <iframe
                  key={previewKey}
                  srcDoc={generatePreview()}
                  className="w-full h-[calc(100%-40px)] border rounded-md"
                  title="Preview"
                  sandbox="allow-scripts"
                />
              </CardContent>
            </Card>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}