// EXEMPLO: Como adicionar um novo exercício

const novoExercicio = {
  id: "html-titulo-e-subtitulo",
  title: "Títulos e Subtítulos",
  description: "Aprenda a usar tags de cabeçalho HTML",
  instructions: "Crie um título principal com <h1> e dois subtítulos com <h2>.",
  difficulty: "iniciante",
  category: "html",
  points: 15,
  order: 5,

  // SEMPRE VAZIO - usuário escreve do zero
  initialCode: { html: "", css: "", javascript: "" },

  // Template inicial com estrutura
  starterTemplate: {
    html: `<!DOCTYPE html>
<html>
<head>
  <title>Títulos e Subtítulos</title>
</head>
<body>
  <!-- Crie seus títulos aqui -->
</body>
</html>`,
    css: "/* Adicione estilos se necessário */",
    javascript: "// JavaScript não necessário neste exercício"
  },

  // Solução completa
  solutionCode: {
    html: `<!DOCTYPE html>
<html>
<head>
  <title>Títulos e Subtítulos</title>
</head>
<body>
  <h1>Título Principal</h1>
  <h2>Primeiro Subtítulo</h2>
  <h2>Segundo Subtítulo</h2>
</body>
</html>`,
    css: "",
    javascript: ""
  },

  // Dicas úteis
  hints: [
    "Use <h1> para o título principal",
    "Use <h2> para subtítulos",
    "Lembre-se de fechar todas as tags"
  ],

  // Regras de validação
  validationRules: [
    {
      type: "contains",
      rule: "<h1>",
      message: "Adicione um título principal com <h1>"
    },
    {
      type: "count",
      rule: "h2",
      count: 2,
      message: "Adicione exatamente 2 subtítulos com <h2>"
    }
  ],

  // Testes executados
  tests: [
    "Deve conter um título <h1>",
    "Deve conter dois subtítulos <h2>",
    "Tags devem estar fechadas corretamente"
  ]
};

// PASSOS PARA ADICIONAR:
// 1. Copie este objeto para scripts/seed-exercises.js na lista de exercícios
// 2. Ajuste os campos conforme necessário
// 3. Execute o seed para Neon
// 4. Teste no frontend