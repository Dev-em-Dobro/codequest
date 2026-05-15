// Script para popular o banco com exercícios iniciais
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { exercises } from "../shared/schema.ts";

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

const sampleExercises = [
  {
    title: "HTML: Primeira Página",
    description: "Crie sua primeira página HTML com título e parágrafo",
    instructions: `
      <h3>Objetivo:</h3>
      <p>Crie uma página HTML básica com as seguintes características:</p>
      <ul>
        <li>Um título principal (h1) com seu nome</li>
        <li>Um parágrafo de apresentação</li>
        <li>Uma lista com seus hobbies favoritos</li>
      </ul>
      
      <h3>Estrutura esperada:</h3>
      <ol>
        <li>Use a tag &lt;h1&gt; para o título</li>
        <li>Use a tag &lt;p&gt; para o parágrafo</li>
        <li>Use &lt;ul&gt; e &lt;li&gt; para a lista</li>
      </ol>
    `,
    difficulty: "iniciante",
    category: "html",
    points: 15,
    order: 1,
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
      css: "/* Adicione estilos CSS aqui se necessário */",
      javascript: "// Adicione JavaScript aqui se necessário"
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
    },
    hints: [
      "Comece com a estrutura básica: <h1>, <p>, <ul>",
      "Lembre-se de fechar todas as tags",
      "Use <li> dentro de <ul> para cada item da lista"
    ],
    validationRules: [
      { type: "contains", rule: "<h1>", message: "Você deve usar a tag <h1> para o título" },
      { type: "contains", rule: "<p>", message: "Você deve usar a tag <p> para o parágrafo" },
      { type: "contains", rule: "<ul>", message: "Você deve criar uma lista com <ul>" }
    ],
    tests: [
      "Verificar se existe tag <h1>",
      "Verificar se existe tag <p>",
      "Verificar se existe lista <ul> com itens <li>"
    ]
  },
  
  {
    title: "CSS: Cores e Fontes",
    description: "Aprenda a estilizar texto com cores e tamanhos de fonte",
    instructions: `
      <h3>Objetivo:</h3>
      <p>Estilize uma página HTML usando CSS:</p>
      <ul>
        <li>Mude a cor do título para azul</li>
        <li>Deixe o parágrafo na cor verde</li>
        <li>Aumente o tamanho da fonte do título</li>
        <li>Centralize todo o conteúdo</li>
      </ul>
      
      <h3>Propriedades CSS a usar:</h3>
      <ul>
        <li><code>color</code> - para definir cores</li>
        <li><code>font-size</code> - para tamanho da fonte</li>
        <li><code>text-align</code> - para alinhamento</li>
      </ul>
    `,
    difficulty: "iniciante",
    category: "css",
    points: 20,
    order: 2,
    initialCode: {
      html: "",
      css: "",
      javascript: ""
    },
    starterTemplate: {
      html: `<!DOCTYPE html>
<html>
<head>
  <title>Página Colorida</title>
</head>
<body>
  <h1>Título Colorido</h1>
  <p>Este é um parágrafo que será estilizado.</p>
</body>
</html>`,
      css: `/* Adicione seus estilos aqui */
body {
  /* Centralize o conteúdo aqui */
}

h1 {
  /* Estilize o título aqui */
}

p {
  /* Estilize o parágrafo aqui */
}`,
      javascript: ""
    },
    solutionCode: {
      html: `<!DOCTYPE html>
<html>
<head>
  <title>Página Colorida</title>
</head>
<body>
  <h1>Título Colorido</h1>
  <p>Este é um parágrafo que será estilizado.</p>
</body>
</html>`,
      css: `body {
  text-align: center;
  font-family: Arial, sans-serif;
}

h1 {
  color: blue;
  font-size: 36px;
}

p {
  color: green;
  font-size: 18px;
}`,
      javascript: ""
    },
    hints: [
      "Use 'color: blue' para deixar o texto azul",
      "Use 'text-align: center' no body para centralizar",
      "font-size aceita valores como '24px' ou '2em'"
    ],
    validationRules: [
      { type: "contains", rule: "color:", message: "Você deve usar a propriedade 'color'" },
      { type: "contains", rule: "blue", message: "O título deve ter cor azul" },
      { type: "contains", rule: "green", message: "O parágrafo deve ter cor verde" }
    ],
    tests: [
      "Verificar se h1 tem cor azul",
      "Verificar se p tem cor verde",
      "Verificar se texto está centralizado"
    ]
  },

  {
    title: "JavaScript: Primeiro Alert",
    description: "Crie seu primeiro código JavaScript interativo",
    instructions: `
      <h3>Objetivo:</h3>
      <p>Crie um código JavaScript que:</p>
      <ul>
        <li>Declare uma variável com seu nome</li>
        <li>Declare uma variável com sua idade</li>
        <li>Exiba uma mensagem de saudação usando alert()</li>
        <li>A mensagem deve incluir nome e idade</li>
      </ul>
      
      <h3>Conceitos a aprender:</h3>
      <ul>
        <li>Declaração de variáveis com <code>let</code></li>
        <li>Concatenação de strings</li>
        <li>Função <code>alert()</code></li>
      </ul>
    `,
    difficulty: "iniciante",
    category: "javascript",
    points: 25,
    order: 3,
    initialCode: {
      html: "",
      css: "",
      javascript: ""
    },
    starterTemplate: {
      html: `<!DOCTYPE html>
<html>
<head>
  <title>Primeiro JavaScript</title>
</head>
<body>
  <h2>Primeiro JavaScript</h2>
  <p>Abra o console do navegador para ver o resultado!</p>
</body>
</html>`,
      css: `body {
  text-align: center;
  font-family: Arial, sans-serif;
  padding: 50px;
}`,
      javascript: `// Declare suas variáveis aqui
let nome = "";
let idade = 0;

// Crie o alert aqui`
    },
    solutionCode: {
      html: `<!DOCTYPE html>
<html>
<head>
  <title>Primeiro JavaScript</title>
</head>
<body>
  <h2>Primeiro JavaScript</h2>
  <p>Abra o console do navegador para ver o resultado!</p>
</body>
</html>`,
      css: `body {
  text-align: center;
  font-family: Arial, sans-serif;
  padding: 50px;
}`,
      javascript: `let nome = "Maria";
let idade = 25;

alert("Olá! Eu me chamo " + nome + " e tenho " + idade + " anos.");`
    },
    hints: [
      "Use 'let nome = \"Seu Nome\"' para declarar uma variável",
      "Para concatenar strings use o símbolo +",
      "alert() exibe uma mensagem na tela"
    ],
    validationRules: [
      { type: "contains", rule: "let", message: "Você deve declarar variáveis com 'let'" },
      { type: "contains", rule: "alert", message: "Você deve usar a função alert()" },
      { type: "contains", rule: "+", message: "Use + para concatenar as strings" }
    ],
    tests: [
      "Verificar se variáveis são declaradas",
      "Verificar se alert() é chamado",
      "Verificar se strings são concatenadas"
    ]
  }
];

async function seedDatabase() {
  try {
    console.log("🌱 Populando banco com exercícios...");
    
    // Limpa exercícios existentes
    await db.delete(exercises);
    
    // Insere novos exercícios
    await db.insert(exercises).values(sampleExercises);
    
    console.log("✅ Exercícios inseridos com sucesso!");
    console.log(`📚 Total: ${sampleExercises.length} exercícios adicionados`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao popular banco:", error);
    process.exit(1);
  }
}

seedDatabase();