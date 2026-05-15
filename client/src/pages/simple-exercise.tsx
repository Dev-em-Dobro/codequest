import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlowCard } from "@/components/ui/spotlight-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Code, 
  Play, 
  RotateCcw, 
  Lightbulb, 
  CheckCircle2,
  ArrowLeft,
  Trophy,
  Gem,
  Home,
  ChevronRight
} from "lucide-react";
import { Header } from "@/components/header";
import { useToast } from "@/hooks/use-toast";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { Link } from "wouter";

// Exercício de exemplo direto no componente
const sampleExercise = {
  id: "html-1",
  title: "HTML: Minha Primeira Página",
  description: "Crie sua primeira página web usando HTML básico",
  category: "HTML",
  difficulty: "Iniciante",
  points: 10,
  instructions: `
    <h3>🎯 Objetivo:</h3>
    <p>Crie uma página HTML básica com as seguintes características:</p>
    <ul>
      <li>Um título principal (h1) com seu nome</li>
      <li>Um parágrafo de apresentação</li>
      <li>Uma lista com seus hobbies favoritos</li>
    </ul>
    
    <h3>📝 Estrutura esperada:</h3>
    <ol>
      <li>Use a tag &lt;h1&gt; para o título</li>
      <li>Use a tag &lt;p&gt; para o parágrafo</li>
      <li>Use &lt;ul&gt; e &lt;li&gt; para a lista</li>
    </ol>
  `,
  hints: [
    "Comece com a estrutura básica: <h1>, <p>, <ul>",
    "Lembre-se de fechar todas as tags",
    "Use <li> dentro de <ul> para cada item da lista"
  ],
  initialCode: {
    html: "",
    css: "",
    javascript: ""
  },
  starterTemplate: {
    html: `<!DOCTYPE html>
<html>
<head>
  <title>Minha Primeira Página</title>
</head>
<body>
  <!-- Escreva seu código HTML aqui -->
  
</body>
</html>`,
    css: `/* Adicione estilos CSS aqui se necessário */`,
    javascript: `// Adicione JavaScript aqui se necessário`
  },
  solutionCode: {
    html: `<!DOCTYPE html>
<html>
<head>
  <title>Minha Primeira Página</title>
</head>
<body>
  <h1>João Silva</h1>
  <p>Olá! Eu sou estudante de programação e estou aprendendo desenvolvimento web.</p>
  <ul>
    <li>Jogar videogames</li>
    <li>Ler livros</li>
    <li>Programar</li>
    <li>Assistir filmes</li>
  </ul>
</body>
</html>`,
    css: "",
    javascript: ""
  }
};

export default function SimpleExercise() {
  const { toast } = useToast();
  
  // Code states - Start with EMPTY editor (initialCode)
  const [htmlCode, setHtmlCode] = useState(sampleExercise.initialCode.html);
  const [cssCode, setCssCode] = useState(sampleExercise.initialCode.css);
  const [jsCode, setJsCode] = useState(sampleExercise.initialCode.javascript);
  const [currentHint, setCurrentHint] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

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
    setHtmlCode(sampleExercise.initialCode.html);
    setCssCode(sampleExercise.initialCode.css);
    setJsCode(sampleExercise.initialCode.javascript);
    setCurrentHint(0);
    setPreviewKey(prev => prev + 1);
    toast({
      title: "Código resetado",
      description: "O código foi resetado para o estado vazio inicial.",
    });
  };

  const loadTemplate = () => {
    setHtmlCode(sampleExercise.starterTemplate.html);
    setCssCode(sampleExercise.starterTemplate.css);
    setJsCode(sampleExercise.starterTemplate.javascript);
    setPreviewKey(prev => prev + 1);
    toast({
      title: "Template carregado",
      description: "Template inicial carregado para ajudar você a começar.",
    });
  };

  const showHint = () => {
    if (currentHint < sampleExercise.hints.length) {
      setCurrentHint(currentHint + 1);
      toast({
        title: `💡 Dica ${currentHint + 1}`,
        description: sampleExercise.hints[currentHint],
      });
    }
  };

  const validateSolution = () => {
    // Simple validation - check if basic elements are present
    const hasH1 = htmlCode.toLowerCase().includes('<h1>');
    const hasP = htmlCode.toLowerCase().includes('<p>');
    const hasUl = htmlCode.toLowerCase().includes('<ul>');
    const hasLi = htmlCode.toLowerCase().includes('<li>');
    
    return hasH1 && hasP && hasUl && hasLi;
  };

  const submitSolution = () => {
    const isValid = validateSolution();
    
    if (isValid) {
      setIsCompleted(true);
      toast({
        title: "🎉 Parabéns!",
        description: `Você completou o exercício e ganhou ${sampleExercise.points} pontos!`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Exercício incompleto",
        description: "Sua solução ainda não atende aos requisitos. Verifique as instruções!",
      });
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/" className="flex items-center text-slate-400 hover:text-purple-400 transition-colors">
                  <Home className="w-4 h-4 mr-1" />
                  Início
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="w-4 h-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-purple-400 font-medium">
                {sampleExercise.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                size="sm"
                onClick={() => window.history.back()}
                className="rpg-button"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <h1 className="text-2xl font-bold" style={{ color: '#fff6e9', fontFamily: 'var(--font-retro)' }}>{sampleExercise.title}</h1>
                  {isCompleted && (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Concluído
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-100 text-green-800">
                    {sampleExercise.difficulty}
                  </Badge>
                  <Badge variant="outline">
                    <Gem className="w-3 h-3 mr-1" />
                    {sampleExercise.points} pontos
                  </Badge>
                  <Badge variant="outline">{sampleExercise.category}</Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button onClick={showHint} disabled={currentHint >= sampleExercise.hints.length} className="rpg-button">
                <Lightbulb className="w-4 h-4 mr-2" />
                Dica {currentHint < sampleExercise.hints.length ? `(${currentHint + 1}/${sampleExercise.hints.length})` : '(esgotadas)'}
              </Button>
              <Button onClick={loadTemplate} className="rpg-button">
                <Code className="w-4 h-4 mr-2" />
                Template
              </Button>
              <Button onClick={resetCode} className="rpg-button">
                <RotateCcw className="w-4 h-4 mr-2" />
                Resetar
              </Button>
              <Button onClick={runCode} className="rpg-button">
                <Play className="w-4 h-4 mr-2" />
                Executar
              </Button>
              {!isCompleted && (
                <Button onClick={submitSolution} className="rpg-button">
                  <Trophy className="w-4 h-4 mr-2" />
                  Enviar Solução
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Instructions Panel */}
          <div className="lg:col-span-1">
            <GlowCard glowColor="purple" customSize={true} className="h-full">
              <CardHeader>
                <h2 className="text-lg" style={{ color: '#fff6e9', fontFamily: 'var(--font-retro)' }}>📋 Instruções</h2>
                <CardDescription style={{ color: '#fff6e9', opacity: 0.8 }}>{sampleExercise.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose prose-sm max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: sampleExercise.instructions }} />
                </div>
                
                {currentHint > 0 && (
                  <Alert>
                    <Lightbulb className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Dicas usadas:</strong>
                      <ul className="mt-2 space-y-1">
                        {sampleExercise.hints.slice(0, currentHint).map((hint, index) => (
                          <li key={index} className="text-sm">• {hint}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </GlowCard>
          </div>

          {/* Code Editor Panel */}
          <div className="lg:col-span-1">
            <GlowCard glowColor="purple" customSize={true} className="h-full">
              <CardHeader>
                <h2 className="text-lg flex items-center" style={{ color: '#fff6e9', fontFamily: 'var(--font-retro)' }}>
                  <Code className="w-5 h-5 mr-2" />
                  Editor de Código
                </h2>
              </CardHeader>
              <CardContent className="h-full pb-2">
                <Tabs defaultValue="html" className="h-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="html">HTML</TabsTrigger>
                    <TabsTrigger value="css">CSS</TabsTrigger>
                    <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="html" className="h-[calc(100%-40px)] mt-4">
                    <textarea
                      value={htmlCode}
                      onChange={(e) => setHtmlCode(e.target.value)}
                      className="input-8bit w-full h-full text-sm resize-none"
                      placeholder="Digite seu código HTML aqui..."
                      spellCheck={false}
                      style={{ minHeight: '400px', fontFamily: 'var(--font-retro)', fontSize: '12px' }}
                    />
                  </TabsContent>
                  
                  <TabsContent value="css" className="h-[calc(100%-40px)] mt-4">
                    <textarea
                      value={cssCode}
                      onChange={(e) => setCssCode(e.target.value)}
                      className="input-8bit w-full h-full text-sm resize-none"
                      placeholder="Digite seu código CSS aqui..."
                      spellCheck={false}
                      style={{ minHeight: '400px', fontFamily: 'var(--font-retro)', fontSize: '12px' }}
                    />
                  </TabsContent>
                  
                  <TabsContent value="javascript" className="h-[calc(100%-40px)] mt-4">
                    <textarea
                      value={jsCode}
                      onChange={(e) => setJsCode(e.target.value)}
                      className="input-8bit w-full h-full text-sm resize-none"
                      placeholder="Digite seu código JavaScript aqui..."
                      spellCheck={false}
                      style={{ minHeight: '400px', fontFamily: 'var(--font-retro)', fontSize: '12px' }}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </GlowCard>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1">
            <GlowCard glowColor="purple" customSize={true} className="h-full">
              <CardHeader>
                <h2 className="text-lg" style={{ color: '#fff6e9', fontFamily: 'var(--font-retro)' }}>🖥️ Preview</h2>
                <CardDescription style={{ color: '#fff6e9', opacity: 0.8 }}>Resultado do seu código</CardDescription>
              </CardHeader>
              <CardContent className="h-full pb-2">
                <iframe
                  key={previewKey}
                  srcDoc={generatePreview()}
                  className="w-full border rounded-md"
                  title="Preview"
                  sandbox="allow-scripts"
                  style={{ height: '500px' }}
                />
              </CardContent>
            </GlowCard>
          </div>
        </div>
      </div>
    </div>
  );
}