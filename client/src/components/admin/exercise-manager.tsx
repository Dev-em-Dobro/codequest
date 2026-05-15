import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Save, 
  Trash2, 
  Edit, 
  Eye,
  Code,
  FileText,
  Settings,
  Lightbulb
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
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

export default function ExerciseManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form state
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Exercise>>({
    title: "",
    description: "",
    category: "html",
    difficulty: "beginner",
    points: 10,
    instructions: "",
    hints: [""],
    starterCode: { html: "", css: "", javascript: "" },
    solution: { html: "", css: "", javascript: "" },
    validation: { type: "element" }
  });

  // Fetch exercises
  const { data: exercises = [], isLoading } = useQuery<Exercise[]>({
    queryKey: ['/api/exercises'],
    staleTime: 15 * 60 * 1000, // 15 minutos - exercícios mudam pouco
  });

  // Create/Update exercise mutation
  const saveExerciseMutation = useMutation({
    mutationFn: (data: Partial<Exercise>) => {
      if (selectedExercise?.id) {
        return apiRequest(`/api/exercises/${selectedExercise.id}`, {
          method: 'PUT',
          body: data
        });
      } else {
        return apiRequest('/api/exercises', {
          method: 'POST',
          body: data
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/exercises'] });
      toast({
        title: "Exercício salvo",
        description: "O exercício foi salvo com sucesso!",
      });
      resetForm();
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível salvar o exercício.",
      });
    }
  });

  // Delete exercise mutation
  const deleteExerciseMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/exercises/${id}`, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/exercises'] });
      toast({
        title: "Exercício deletado",
        description: "O exercício foi removido com sucesso!",
      });
      resetForm();
    }
  });

  const resetForm = () => {
    setSelectedExercise(null);
    setIsEditing(false);
    setFormData({
      title: "",
      description: "",
      category: "html",
      difficulty: "beginner",
      points: 10,
      instructions: "",
      hints: [""],
      starterCode: { html: "", css: "", javascript: "" },
      solution: { html: "", css: "", javascript: "" },
      validation: { type: "element" }
    });
  };

  const editExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setFormData(exercise);
    setIsEditing(true);
  };

  const handleSave = () => {
    // Validation
    if (!formData.title || !formData.description || !formData.instructions) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
      });
      return;
    }

    saveExerciseMutation.mutate(formData);
  };

  const addHint = () => {
    setFormData(prev => ({
      ...prev,
      hints: [...(prev.hints || []), ""]
    }));
  };

  const updateHint = (index: number, value: string) => {
    const newHints = [...(formData.hints || [])];
    newHints[index] = value;
    setFormData(prev => ({ ...prev, hints: newHints }));
  };

  const removeHint = (index: number) => {
    const newHints = (formData.hints || []).filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, hints: newHints }));
  };

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gerenciar Exercícios</h1>
        <p className="text-gray-600">Crie e edite exercícios para a plataforma Code Quest</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Exercise List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>Exercícios Existentes</CardTitle>
                <Button size="sm" onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Carregando...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {exercises.map((exercise) => (
                    <div
                      key={exercise.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                        selectedExercise?.id === exercise.id ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => editExercise(exercise)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{exercise.title}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {exercise.category}
                            </Badge>
                            <Badge className={`text-xs ${difficultyColors[exercise.difficulty]}`}>
                              {difficultyLabels[exercise.difficulty]}
                            </Badge>
                            <span className="text-xs text-gray-500">{exercise.points}pt</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`/editor?id=${exercise.id}`, '_blank');
                            }}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteExerciseMutation.mutate(exercise.id);
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Exercise Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {isEditing ? <Edit className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
                {isEditing ? 'Editar Exercício' : 'Novo Exercício'}
              </CardTitle>
              <CardDescription>
                {isEditing ? 'Modifique os dados do exercício selecionado' : 'Crie um novo exercício para a plataforma'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Básico</TabsTrigger>
                  <TabsTrigger value="content">Conteúdo</TabsTrigger>
                  <TabsTrigger value="code">Código</TabsTrigger>
                  <TabsTrigger value="validation">Validação</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Título *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Ex: HTML: Primeira Página"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Categoria</Label>
                      <Select 
                        value={formData.category} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
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
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="difficulty">Dificuldade</Label>
                      <Select 
                        value={formData.difficulty} 
                        onValueChange={(value: any) => setFormData(prev => ({ ...prev, difficulty: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Iniciante</SelectItem>
                          <SelectItem value="intermediate">Intermediário</SelectItem>
                          <SelectItem value="advanced">Avançado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="points">Pontos</Label>
                      <Input
                        id="points"
                        type="number"
                        value={formData.points}
                        onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) }))}
                        min="1"
                        max="100"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Breve descrição do exercício"
                      rows={3}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="content" className="space-y-4">
                  <div>
                    <Label htmlFor="instructions">Instruções *</Label>
                    <Textarea
                      id="instructions"
                      value={formData.instructions}
                      onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                      placeholder="Instruções detalhadas do exercício (pode usar HTML)"
                      rows={6}
                    />
                  </div>

                  <Separator />

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label>Dicas</Label>
                      <Button variant="outline" size="sm" onClick={addHint}>
                        <Lightbulb className="w-4 h-4 mr-2" />
                        Adicionar Dica
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {(formData.hints || []).map((hint, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input
                            value={hint}
                            onChange={(e) => updateHint(index, e.target.value)}
                            placeholder={`Dica ${index + 1}`}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeHint(index)}
                            disabled={formData.hints?.length === 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="code" className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Código Inicial</h4>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="starter-html">HTML</Label>
                          <Textarea
                            id="starter-html"
                            value={formData.starterCode?.html}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              starterCode: { ...prev.starterCode!, html: e.target.value }
                            }))}
                            placeholder="Código HTML inicial"
                            rows={4}
                            className="font-mono text-sm"
                          />
                        </div>
                        <div>
                          <Label htmlFor="starter-css">CSS</Label>
                          <Textarea
                            id="starter-css"
                            value={formData.starterCode?.css}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              starterCode: { ...prev.starterCode!, css: e.target.value }
                            }))}
                            placeholder="Código CSS inicial"
                            rows={4}
                            className="font-mono text-sm"
                          />
                        </div>
                        <div>
                          <Label htmlFor="starter-js">JavaScript</Label>
                          <Textarea
                            id="starter-js"
                            value={formData.starterCode?.javascript}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              starterCode: { ...prev.starterCode!, javascript: e.target.value }
                            }))}
                            placeholder="Código JavaScript inicial"
                            rows={4}
                            className="font-mono text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Solução</h4>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="solution-html">HTML</Label>
                          <Textarea
                            id="solution-html"
                            value={formData.solution?.html}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              solution: { ...prev.solution!, html: e.target.value }
                            }))}
                            placeholder="Solução HTML"
                            rows={4}
                            className="font-mono text-sm"
                          />
                        </div>
                        <div>
                          <Label htmlFor="solution-css">CSS</Label>
                          <Textarea
                            id="solution-css"
                            value={formData.solution?.css}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              solution: { ...prev.solution!, css: e.target.value }
                            }))}
                            placeholder="Solução CSS"
                            rows={4}
                            className="font-mono text-sm"
                          />
                        </div>
                        <div>
                          <Label htmlFor="solution-js">JavaScript</Label>
                          <Textarea
                            id="solution-js"
                            value={formData.solution?.javascript}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              solution: { ...prev.solution!, javascript: e.target.value }
                            }))}
                            placeholder="Solução JavaScript"
                            rows={4}
                            className="font-mono text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="validation" className="space-y-4">
                  <div>
                    <Label htmlFor="validation-type">Tipo de Validação</Label>
                    <Select 
                      value={formData.validation?.type} 
                      onValueChange={(value: any) => setFormData(prev => ({
                        ...prev,
                        validation: { ...prev.validation!, type: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="element">Elemento HTML</SelectItem>
                        <SelectItem value="style">Propriedade CSS</SelectItem>
                        <SelectItem value="output">Conteúdo de Saída</SelectItem>
                        <SelectItem value="function">Função JavaScript</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.validation?.type === 'element' && (
                    <div>
                      <Label htmlFor="validation-target">Elemento Alvo</Label>
                      <Input
                        id="validation-target"
                        value={formData.validation?.target || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          validation: { ...prev.validation!, target: e.target.value }
                        }))}
                        placeholder="Ex: h1, div, p"
                      />
                    </div>
                  )}

                  {formData.validation?.type === 'style' && (
                    <div>
                      <Label htmlFor="validation-target">Propriedade CSS</Label>
                      <Input
                        id="validation-target"
                        value={formData.validation?.target || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          validation: { ...prev.validation!, target: e.target.value }
                        }))}
                        placeholder="Ex: color, background-color, font-size"
                      />
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={saveExerciseMutation.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  {saveExerciseMutation.isPending ? 'Salvando...' : 'Salvar Exercício'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}