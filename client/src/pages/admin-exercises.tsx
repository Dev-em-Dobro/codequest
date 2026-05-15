import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/simple-auth-client";
import { queryKeys } from "@/lib/queryKeys";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Exercise, InsertExercise } from "@shared/schema";

interface ExerciseForm extends Omit<InsertExercise, 'initialCode' | 'starterTemplate' | 'solutionCode' | 'hints' | 'validationRules' | 'tests'> {
  initialCode: {
    html: string;
    css: string;
    javascript: string;
  };
  starterTemplate: {
    html: string;
    css: string;
    javascript: string;
  };
  solutionCode: {
    html: string;
    css: string;
    javascript: string;
  };
  hints: string[];
  validationRules: { type: string; rule: string; message: string; }[];
  tests: string[];
}

const emptyForm: ExerciseForm = {
  title: "",
  description: "",
  instructions: "",
  difficulty: "iniciante",
  category: "html",
  points: 10,
  order: 1,
  initialCode: {
    html: "",
    css: "",
    javascript: ""
  },
  starterTemplate: {
    html: "<!DOCTYPE html>\n<html>\n<head>\n  <title>Exercise</title>\n</head>\n<body>\n  <!-- Write your code here -->\n</body>\n</html>",
    css: "/* Add your styles here */",
    javascript: "// Add your JavaScript here"
  },
  solutionCode: {
    html: "",
    css: "",
    javascript: ""
  },
  hints: [],
  validationRules: [],
  tests: []
};

export default function AdminExercises() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ExerciseForm>(emptyForm);
  const [newHint, setNewHint] = useState("");
  const [newTest, setNewTest] = useState("");

  // Memoized query keys
  const exercisesQueryKey = useMemo(() => queryKeys.exercises(), []);

  // Fetch exercises
  const { data: exercises, isLoading } = useQuery({
    queryKey: exercisesQueryKey,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!isAuthenticated && !authLoading,
    select: (data) => data || [],
    placeholderData: [],
  });

  // Create exercise mutation
  const createMutation = useMutation({
    mutationFn: async (data: ExerciseForm) => {
      return await apiRequest('POST', '/api/exercises', data);
    },
    onSuccess: (newExercise) => {
      // Surgical invalidation - only invalidate exercises lists
      queryClient.invalidateQueries({ queryKey: queryKeys.exercises() });
      
      // Optionally, set the new exercise data directly to avoid refetch
      if (newExercise?.id) {
        queryClient.setQueryData(queryKeys.exerciseById(newExercise.id), newExercise);
      }
      
      setIsCreating(false);
      setFormData(emptyForm);
      toast({ title: "Exercício criado com sucesso!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao criar exercício", description: error.message, variant: "destructive" });
    }
  });

  // Update exercise mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ExerciseForm> }) => {
      return await apiRequest('PATCH', `/api/exercises/${id}`, data);
    },
    onSuccess: (updatedExercise, { id }) => {
      // Surgical invalidation - invalidate specific exercise and exercises list
      queryClient.invalidateQueries({ queryKey: queryKeys.exercises() });
      queryClient.invalidateQueries({ queryKey: queryKeys.exerciseById(id) });
      
      setEditingId(null);
      setFormData(emptyForm);
      toast({ title: "Exercício atualizado com sucesso!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao atualizar exercício", description: error.message, variant: "destructive" });
    }
  });

  // Delete exercise mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/exercises/${id}`);
    },
    onSuccess: (_, deletedId) => {
      // Surgical invalidation - remove from cache and invalidate lists
      queryClient.removeQueries({ queryKey: queryKeys.exerciseById(deletedId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.exercises() });
      
      toast({ title: "Exercício excluído com sucesso!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao excluir exercício", description: error.message, variant: "destructive" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const startEdit = (exercise: Exercise) => {
    setEditingId(exercise.id);
    setFormData({
      title: exercise.title,
      description: exercise.description,
      instructions: exercise.instructions,
      difficulty: exercise.difficulty,
      category: exercise.category,
      points: exercise.points,
      order: exercise.order,
      initialCode: exercise.initialCode,
      starterTemplate: exercise.starterTemplate,
      solutionCode: exercise.solutionCode,
      hints: exercise.hints || [],
      validationRules: exercise.validationRules || [],
      tests: exercise.tests || []
    });
    setIsCreating(true);
  };

  const cancelEdit = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData(emptyForm);
    setNewHint("");
    setNewTest("");
  };

  const addHint = () => {
    if (newHint.trim()) {
      setFormData(prev => ({
        ...prev,
        hints: [...prev.hints, newHint.trim()]
      }));
      setNewHint("");
    }
  };

  const removeHint = (index: number) => {
    setFormData(prev => ({
      ...prev,
      hints: prev.hints.filter((_, i) => i !== index)
    }));
  };

  const addTest = () => {
    if (newTest.trim()) {
      setFormData(prev => ({
        ...prev,
        tests: [...prev.tests, newTest.trim()]
      }));
      setNewTest("");
    }
  };

  const removeTest = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tests: prev.tests.filter((_, i) => i !== index)
    }));
  };

  if (isLoading) {
    return <div className="p-8">Carregando exercícios...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Administração de Exercícios</h1>
            <p className="text-gray-600 mt-2">Gerencie os exercícios da plataforma CodeQuest</p>
          </div>
          
          <Button 
            onClick={() => setIsCreating(true)}
            className="bg-[#ae32f8] hover:bg-[#919595]"
            disabled={isCreating}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Exercício
          </Button>
        </div>

        {/* Form for creating/editing */}
        {isCreating && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editingId ? 'Editar Exercício' : 'Criar Novo Exercício'}</CardTitle>
              <CardDescription>
                Preencha os campos abaixo para {editingId ? 'atualizar' : 'criar'} o exercício.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ex: HTML: Primeira Página"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value: "html" | "css" | "javascript") => 
                        setFormData(prev => ({ ...prev, category: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="html">HTML</SelectItem>
                        <SelectItem value="css">CSS</SelectItem>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Dificuldade</Label>
                    <Select
                      value={formData.difficulty}
                      onValueChange={(value: "iniciante" | "intermediario" | "avancado") => 
                        setFormData(prev => ({ ...prev, difficulty: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="iniciante">Iniciante</SelectItem>
                        <SelectItem value="intermediario">Intermediário</SelectItem>
                        <SelectItem value="avancado">Avançado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="points">Pontos</Label>
                    <Input
                      id="points"
                      type="number"
                      value={formData.points}
                      onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                      min="1"
                      max="100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="order">Ordem</Label>
                    <Input
                      id="order"
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
                      min="1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrição breve do exercício"
                    rows={2}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions">Instruções (HTML)</Label>
                  <Textarea
                    id="instructions"
                    value={formData.instructions}
                    onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                    placeholder="Instruções detalhadas em HTML"
                    rows={4}
                    required
                  />
                </div>

                {/* Code Sections */}
                <Tabs defaultValue="starter" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="starter">Template Inicial</TabsTrigger>
                    <TabsTrigger value="solution">Solução</TabsTrigger>
                    <TabsTrigger value="hints">Dicas & Testes</TabsTrigger>
                  </TabsList>

                  <TabsContent value="starter" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>HTML Template</Label>
                        <Textarea
                          value={formData.starterTemplate.html}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            starterTemplate: { ...prev.starterTemplate, html: e.target.value }
                          }))}
                          rows={8}
                          className="font-mono text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>CSS Template</Label>
                        <Textarea
                          value={formData.starterTemplate.css}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            starterTemplate: { ...prev.starterTemplate, css: e.target.value }
                          }))}
                          rows={8}
                          className="font-mono text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>JavaScript Template</Label>
                        <Textarea
                          value={formData.starterTemplate.javascript}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            starterTemplate: { ...prev.starterTemplate, javascript: e.target.value }
                          }))}
                          rows={8}
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="solution" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>HTML Solução</Label>
                        <Textarea
                          value={formData.solutionCode.html}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            solutionCode: { ...prev.solutionCode, html: e.target.value }
                          }))}
                          rows={8}
                          className="font-mono text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>CSS Solução</Label>
                        <Textarea
                          value={formData.solutionCode.css}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            solutionCode: { ...prev.solutionCode, css: e.target.value }
                          }))}
                          rows={8}
                          className="font-mono text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>JavaScript Solução</Label>
                        <Textarea
                          value={formData.solutionCode.javascript}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            solutionCode: { ...prev.solutionCode, javascript: e.target.value }
                          }))}
                          rows={8}
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="hints" className="space-y-6">
                    {/* Hints */}
                    <div className="space-y-4">
                      <Label>Dicas</Label>
                      <div className="flex gap-2">
                        <Input
                          value={newHint}
                          onChange={(e) => setNewHint(e.target.value)}
                          placeholder="Digite uma nova dica"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHint())}
                        />
                        <Button type="button" onClick={addHint} size="sm">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {formData.hints.map((hint, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                            <span className="flex-1 text-sm">{hint}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeHint(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tests */}
                    <div className="space-y-4">
                      <Label>Testes</Label>
                      <div className="flex gap-2">
                        <Input
                          value={newTest}
                          onChange={(e) => setNewTest(e.target.value)}
                          placeholder="Digite um novo teste"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTest())}
                        />
                        <Button type="button" onClick={addTest} size="sm">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {formData.tests.map((test, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                            <span className="flex-1 text-sm">{test}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTest(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex gap-4 pt-4">
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="bg-[#ae32f8] hover:bg-[#919595]"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingId ? 'Atualizar' : 'Criar'} Exercício
                  </Button>
                  <Button type="button" variant="outline" onClick={cancelEdit}>
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Exercise List */}
        <div className="grid gap-6">
          {exercises?.map((exercise: Exercise) => (
            <Card key={exercise.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{exercise.title}</CardTitle>
                    <CardDescription className="mt-1">{exercise.description}</CardDescription>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="outline">{exercise.category.toUpperCase()}</Badge>
                      <Badge className={
                        exercise.difficulty === 'iniciante' ? 'bg-green-100 text-green-800' :
                        exercise.difficulty === 'intermediario' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {exercise.difficulty}
                      </Badge>
                      <Badge variant="outline">{exercise.points} pontos</Badge>
                      <Badge variant="outline">Ordem: {exercise.order}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(exercise)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteMutation.mutate(exercise.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}