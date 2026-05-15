import { useState } from 'react';
import { useLocation } from 'wouter';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/simple-auth-client';

export default function AddExercisePage() {
  const [, setLocation] = useLocation();
  const [jsonInput, setJsonInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const exampleExercise = {
    id: "html-tags-essenciais-cabecalho",
    title: "HTML: Tags Essenciais - Cabeçalho",
    description: "Aprenda a usar a tag <h1> para criar o título principal da página.",
    difficulty: "iniciante",
    category: "html",
    points: 10,
    instructions: "Crie um elemento <h1> com o texto 'Bem-vindo à minha página!' dentro da tag <body>.",
    solutionCode: {
      html: "<h1>Bem-vindo à minha página!</h1>",
      css: "",
      javascript: ""
    },
    hints: [
      "Use a tag <h1> para criar um título principal",
      "Coloque o texto exatamente entre as tags de abertura e fechamento"
    ],
    validationRules: [
      {
        type: "contains",
        rule: "<h1>Bem-vindo à minha página!</h1>",
        message: "Seu código deve conter um título principal com o texto correto"
      }
    ],
    tests: [
      "Deve conter a tag <h1>",
      "Deve ter o texto correto dentro do cabeçalho"
    ]
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verifica se o usuário está logado
    const token = user?.id || localStorage.getItem('sessionId');
    if (!token) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para criar exercícios",
        variant: "destructive",
      });
      setTimeout(() => setLocation('/auth/signin'), 2000);
      return;
    }
    
    setLoading(true);

    try {
      console.log('JSON sendo enviado:', jsonInput); // Log do que está sendo enviado
      console.log('Token de autenticação:', token);
      
      // Envia o texto direto para a API processar
      const response = await fetch('/api/admin/exercises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Adiciona o token de autenticação
        },
        body: jsonInput, // Envia exatamente o que foi digitado/colado no campo
      });

      const result = await response.json();
      console.log('Resposta da API:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar exercício');
      }

      toast({
        title: "Sucesso!",
        description: "Exercício criado com sucesso!",
      });

      setJsonInput(''); // Limpa o campo apenas após sucesso
      
      setTimeout(() => {
        setLocation('/');
      }, 2000);
    } catch (err) {
      console.error('Erro:', err);
      toast({
        title: "Erro",
        description: err instanceof Error ? err.message : 'Erro ao criar exercício',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadExample = () => {
    setJsonInput(JSON.stringify(exampleExercise, null, 2));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-4xl mx-auto p-4 mt-8">
        <h1 className="text-3xl font-bold mb-8 rpg-title">Adicionar Novo Exercício</h1>
        
        <Card className="p-6 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">JSON do Exercício</h2>
            <Button
              onClick={loadExample}
              variant="outline"
            >
              Carregar Exemplo
            </Button>
          </div>

          <form onSubmit={handleSubmit}>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Cole aqui o JSON do exercício..."
              className="w-full h-96 p-4 bg-gray-900 text-white font-mono text-sm rounded-lg border border-gray-700 focus:border-accent focus:outline-none"
              required
            />

            <div className="mt-6 flex gap-4">
              <Button
                type="submit"
                disabled={loading || !jsonInput}
                className="rpg-button"
              >
                {loading ? 'Criando...' : 'Criar Exercício'}
              </Button>
              
              <Button
                type="button"
                onClick={() => setLocation('/')}
                variant="outline"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Estrutura do JSON</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li>• <strong className="text-foreground">id:</strong> Identificador único do exercício</li>
            <li>• <strong className="text-foreground">title:</strong> Título do exercício</li>
            <li>• <strong className="text-foreground">description:</strong> Descrição do exercício</li>
            <li>• <strong className="text-foreground">difficulty:</strong> iniciante | intermediario | avancado</li>
            <li>• <strong className="text-foreground">category:</strong> html | css | javascript</li>
            <li>• <strong className="text-foreground">points:</strong> Pontos do exercício</li>
            <li>• <strong className="text-foreground">instructions:</strong> Instruções detalhadas</li>
            <li>• <strong className="text-foreground">solutionCode:</strong> Objeto com html, css e javascript</li>
            <li>• <strong className="text-foreground">hints:</strong> Array de dicas</li>
            <li>• <strong className="text-foreground">validationRules:</strong> Array de regras de validação</li>
            <li>• <strong className="text-foreground">tests:</strong> Array de descrições de testes</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}