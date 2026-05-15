export const sampleExercises = [
  {
    id: "html-1",
    title: "HTML: Minha Primeira Página",
    description: "Crie sua primeira página web usando HTML básico",
    category: "html",
    difficulty: "beginner" as const,
    points: 10,
    order: 1,
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
    },
    tests: [
      "Verificar se existe tag <h1>",
      "Verificar se existe tag <p>",
      "Verificar se existe lista <ul> com itens <li>"
    ],
    validationRules: [
      {
        type: "element",
        rule: "h1",
        message: "Adicione um título principal com a tag <h1>"
      },
      {
        type: "element", 
        rule: "p",
        message: "Adicione um parágrafo com a tag <p>"
      },
      {
        type: "element",
        rule: "ul li",
        message: "Adicione uma lista com <ul> e itens <li>"
      }
    ]
  },
  
  {
    id: "html-2", 
    title: "HTML: Criando Links",
    description: "Aprenda a criar links e navegar entre páginas",
    category: "html",
    difficulty: "beginner" as const,
    points: 15,
    order: 2,
    instructions: `
      <h3>Objetivo:</h3>
      <p>Crie uma página com diferentes tipos de links:</p>
      <ul>
        <li>Um link para um site externo (ex: Google)</li>
        <li>Um link de email</li>
        <li>Um link que abre em nova aba</li>
      </ul>
      
      <h3>Dicas importantes:</h3>
      <ul>
        <li>Use a tag &lt;a&gt; com o atributo href</li>
        <li>Para email use: href="mailto:email@exemplo.com"</li>
        <li>Para nova aba use: target="_blank"</li>
      </ul>
    `,
    hints: [
      "A tag <a> precisa do atributo href para funcionar",
      "Para links externos, inclua http:// ou https://",
      "O atributo target='_blank' abre em nova aba"
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
  <title>Meus Links</title>
</head>
<body>
  <!-- Crie seus links aqui -->
  
</body>
</html>`,
      css: `/* Adicione estilos para os links se desejar */`,
      javascript: `// JavaScript opcional`
    },
    solutionCode: {
      html: `<!DOCTYPE html>
<html>
<head>
  <title>Meus Links</title>
</head>
<body>
  <h1>Meus Links Favoritos</h1>
  <p>Aqui estão alguns links úteis:</p>
  <ul>
    <li><a href="https://www.google.com">Buscar no Google</a></li>
    <li><a href="mailto:contato@exemplo.com">Enviar Email</a></li>
    <li><a href="https://github.com" target="_blank">GitHub (nova aba)</a></li>
  </ul>
</body>
</html>`,
      css: "",
      javascript: ""
    },
    tests: [
      "Verificar se existem links <a>",
      "Verificar se existe link com href externo",
      "Verificar se existe link mailto",
      "Verificar se existe link com target='_blank'"
    ],
    validationRules: [
      {
        type: "element",
        rule: "a[href]",
        message: "Adicione links com a tag <a> e atributo href"
      },
      {
        type: "element", 
        rule: "a[href^='mailto:']",
        message: "Adicione um link de email com href='mailto:'"
      },
      {
        type: "element",
        rule: "a[target='_blank']",
        message: "Adicione um link que abre em nova aba com target='_blank'"
      }
    ]
  },

  {
    id: "css-1",
    title: "CSS: Cores e Fontes",
    description: "Aprenda a estilizar texto com cores e fontes diferentes",
    category: "css",
    difficulty: "beginner" as const,
    points: 15,
    order: 3,
    instructions: `
      <h3>Objetivo:</h3>
      <p>Estilize o texto da página usando CSS:</p>
      <ul>
        <li>Mude a cor do título para azul</li>
        <li>Altere a fonte do parágrafo</li>
        <li>Adicione uma cor de fundo</li>
      </ul>
      
      <h3>Propriedades para usar:</h3>
      <ul>
        <li>color - para cor do texto</li>
        <li>background-color - para cor de fundo</li>
        <li>font-family - para tipo de fonte</li>
        <li>font-size - para tamanho da fonte</li>
      </ul>
    `,
    hints: [
      "Use color: blue; para mudar a cor do texto",
      "background-color aceita nomes de cores como 'lightblue'",
      "font-family: Arial, sans-serif; é uma boa opção"
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
  <title>Cores e Fontes</title>
</head>
<body>
  <h1>Título Colorido</h1>
  <p>Este parágrafo será estilizado com CSS.</p>
</body>
</html>`,
      css: `/* Adicione seus estilos CSS aqui */`,
      javascript: ""
    },
    solutionCode: {
      html: `<!DOCTYPE html>
<html>
<head>
  <title>Cores e Fontes</title>
</head>
<body>
  <h1>Título Colorido</h1>
  <p>Este parágrafo será estilizado com CSS.</p>
</body>
</html>`,
      css: `h1 {
  color: blue;
  font-size: 2em;
}

p {
  font-family: Arial, sans-serif;
  color: #333;
}

body {
  background-color: lightblue;
  padding: 20px;
}`,
      javascript: ""
    },
    tests: [
      "Verificar se h1 tem cor definida",
      "Verificar se existe background-color",
      "Verificar se existe font-family"
    ],
    validationRules: [
      {
        type: "style",
        rule: "color",
        message: "Adicione cores aos elementos com a propriedade color"
      },
      {
        type: "style", 
        rule: "background-color",
        message: "Adicione uma cor de fundo com background-color"
      },
      {
        type: "style",
        rule: "font-family",
        message: "Defina uma fonte com font-family"
      }
    ]
  },

  {
    id: "js-1", 
    title: "JavaScript: Primeiro Script",
    description: "Crie sua primeira interação com JavaScript",
    category: "javascript",
    difficulty: "beginner" as const,
    points: 20,
    order: 4,
    instructions: `
      <h3>Objetivo:</h3>
      <p>Crie um botão que mostra uma mensagem quando clicado:</p>
      <ul>
        <li>Um botão HTML</li>
        <li>Uma função JavaScript</li>
        <li>Exibir alerta ou mudar texto da página</li>
      </ul>
      
      <h3>Como fazer:</h3>
      <ol>
        <li>Crie um botão com onclick</li>
        <li>Escreva uma função no JavaScript</li>
        <li>Use alert() ou innerHTML para mostrar a mensagem</li>
      </ol>
    `,
    hints: [
      "Use <button onclick='minhaFuncao()'>Clique aqui</button>",
      "No JavaScript: function minhaFuncao() { ... }",
      "alert('mensagem') mostra uma janela popup"
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
  <title>Minha Primeira Interação</title>
</head>
<body>
  <!-- Crie seu HTML aqui -->
  
</body>
</html>`,
      css: `/* Estilize seu botão aqui */`,
      javascript: `// Crie sua função JavaScript aqui`
    },
    solutionCode: {
      html: `<!DOCTYPE html>
<html>
<head>
  <title>Minha Primeira Interação</title>
</head>
<body>
  <h1>Minha Primeira Interação</h1>
  <button onclick="mostrarMensagem()">Clique em mim!</button>
  <p id="resultado"></p>
</body>
</html>`,
      css: `button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: blue;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: darkblue;
}`,
      javascript: `function mostrarMensagem() {
  alert('Parabéns! Você criou sua primeira interação!');
  document.getElementById('resultado').innerHTML = 'Botão foi clicado com sucesso!';
}`
    },
    tests: [
      "Verificar se existe botão",
      "Verificar se existe função JavaScript",
      "Verificar se o botão tem onclick"
    ],
    validationRules: [
      {
        type: "element",
        rule: "button",
        message: "Crie um botão HTML"
      },
      {
        type: "function", 
        rule: "mostrarMensagem",
        message: "Crie uma função JavaScript chamada mostrarMensagem"
      },
      {
        type: "attribute",
        rule: "onclick",
        message: "Adicione onclick ao botão para chamar a função"
      }
    ]
  },

  {
    id: "css-2",
    title: "CSS: Layout com Flexbox",
    description: "Aprenda a criar layouts flexíveis com CSS Flexbox",
    category: "css", 
    difficulty: "intermediate" as const,
    points: 25,
    order: 5,
    instructions: `
      <h3>Objetivo:</h3>
      <p>Crie um layout usando Flexbox com:</p>
      <ul>
        <li>Um cabeçalho</li>
        <li>Três colunas lado a lado</li>
        <li>Um rodapé</li>
      </ul>
      
      <h3>Propriedades do Flexbox:</h3>
      <ul>
        <li>display: flex - torna o elemento flexível</li>
        <li>justify-content - alinha horizontalmente</li>
        <li>align-items - alinha verticalmente</li>
        <li>flex: 1 - faz o item crescer</li>
      </ul>
    `,
    hints: [
      "Use display: flex no container das colunas",
      "justify-content: space-between distribui o espaço",
      "Cada coluna pode ter flex: 1 para tamanho igual"
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
  <title>Layout Flexbox</title>
</head>
<body>
  <!-- Crie o layout aqui -->
  
</body>
</html>`,
      css: `/* Adicione o CSS do Flexbox aqui */`,
      javascript: ""
    },
    solutionCode: {
      html: `<!DOCTYPE html>
<html>
<head>
  <title>Layout Flexbox</title>
</head>
<body>
  <header>
    <h1>Meu Site</h1>
  </header>

  <main class="colunas">
    <div class="coluna">
      <h2>Coluna 1</h2>
      <p>Conteúdo da primeira coluna.</p>
    </div>
    <div class="coluna">
      <h2>Coluna 2</h2>
      <p>Conteúdo da segunda coluna.</p>
    </div>
    <div class="coluna">
      <h2>Coluna 3</h2>
      <p>Conteúdo da terceira coluna.</p>
    </div>
  </main>

  <footer>
    <p>© 2024 Meu Site</p>
  </footer>
</body>
</html>`,
      css: `body {
  margin: 0;
  font-family: Arial, sans-serif;
}

header {
  background-color: #333;
  color: white;
  text-align: center;
  padding: 20px;
}

.colunas {
  display: flex;
  gap: 20px;
  padding: 20px;
  min-height: 300px;
}

.coluna {
  flex: 1;
  background-color: #f4f4f4;
  padding: 20px;
  border-radius: 8px;
}

footer {
  background-color: #333;
  color: white;
  text-align: center;
  padding: 10px;
}`,
      javascript: ""
    },
    tests: [
      "Verificar se existe display: flex",
      "Verificar se existe estrutura header, main, footer",
      "Verificar se colunas têm flex: 1"
    ],
    validationRules: [
      {
        type: "style",
        rule: "display: flex",
        message: "Use display: flex para criar o layout flexível"
      },
      {
        type: "element", 
        rule: "header",
        message: "Crie um cabeçalho com a tag header"
      },
      {
        type: "style",
        rule: "flex: 1",
        message: "Use flex: 1 nas colunas para distribuir o espaço"
      }
    ]
  }
];

// Função para popular o storage com exercícios de exemplo
export function populateWithSampleExercises() {
  return sampleExercises.map((exercise, index) => ({
    ...exercise,
    id: (index + 1).toString(), // IDs sequenciais
    difficulty: exercise.difficulty === "beginner" ? "iniciante" as const : 
                exercise.difficulty === "intermediate" ? "intermediario" as const :
                "avancado" as const
  }));
}