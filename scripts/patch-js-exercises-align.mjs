import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(root, "next-app", ".env");

for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
    ) {
        v = v.slice(1, -1);
    }
    if (k && !(k in process.env)) process.env[k] = v;
}

function parseSolution(raw) {
    if (!raw) return { html: "", css: "", javascript: "" };
    if (typeof raw === "object" && raw !== null) {
        return {
            html: raw.html || "",
            css: raw.css || "",
            javascript: raw.javascript || "",
        };
    }
    try {
        const parsed = JSON.parse(raw);
        return {
            html: parsed.html || "",
            css: parsed.css || "",
            javascript: parsed.javascript || "",
        };
    } catch {
        return { html: "", css: "", javascript: String(raw) };
    }
}

function extractScript(html) {
    const match = String(html || "").match(/<script[^>]*>([\s\S]*?)<\/script>/i);
    return match ? match[1].trim() : "";
}

/** Regras mais semânticas (menos sintaxe exata) — IA é o juiz, mas mantemos alinhadas. */
const RULE_OVERRIDES = {
    "javascript-arrow-function": [
        { type: "contains", rule: "=>", message: "Você deve usar uma arrow function com =>" },
        { type: "contains", rule: "return", message: "A arrow function deve retornar o resultado da multiplicação" },
        { type: "contains", rule: "console.log", message: "Você deve exibir o valor retornado no console com console.log()" },
    ],
    "javascript-funcao-com-retorno-soma": [
        { type: "contains", rule: "function", message: "Você deve criar uma função (nomeada ou equivalente)" },
        { type: "contains", rule: "return", message: "A função deve retornar o resultado da soma" },
        { type: "contains", rule: "console.log", message: "Você deve exibir o valor retornado no console com console.log()" },
    ],
    "javascript-arrays-for-foreach": [
        { type: "contains", rule: "for", message: "Você deve percorrer o array usando um loop for" },
        { type: "contains", rule: "forEach", message: "Você deve percorrer o array usando forEach" },
        { type: "contains", rule: "console.log", message: "Você deve exibir os valores no console" },
    ],
    "javascript-tipos-primitivos": [
        { type: "contains", rule: "console.log", message: "Você deve exibir os valores no console com console.log()" },
        { type: "contains", rule: "null", message: "Você deve criar uma variável com valor null" },
    ],
    "javascript-find-array-objetos": [
        { type: "contains", rule: ".find", message: "Você deve usar o método find para procurar um item" },
        { type: "contains", rule: "console.log", message: "Você deve exibir o resultado da busca no console" },
    ],
    "javascript-filter-objetos": [
        { type: "contains", rule: ".filter", message: "Você deve usar o método filter para criar um novo array" },
        { type: "contains", rule: "console.log", message: "Você deve exibir os arrays no console" },
    ],
    "javascript-map-objetos": [
        { type: "contains", rule: ".map", message: "Você deve usar o método map para percorrer o array" },
        { type: "contains", rule: "console.log", message: "Você deve exibir os arrays no console" },
    ],
    "javascript-reduce-carrinho": [
        { type: "contains", rule: ".reduce", message: "Você deve usar o método reduce para somar os preços" },
        { type: "contains", rule: "console.log", message: "Você deve exibir o total no console" },
    ],
    "javascript-reduce-soma": [
        { type: "contains", rule: ".reduce", message: "Você deve usar o método reduce para somar os valores" },
        { type: "contains", rule: "console.log", message: "Você deve exibir o resultado da soma no console" },
    ],
    "javascript-destructuring-rest-default": [
        { type: "contains", rule: "...", message: "Você deve usar o rest operator (...)" },
        { type: "contains", rule: "console.log", message: "Você deve exibir o novo objeto no console" },
    ],
    "javascript-spread-operator": [
        { type: "contains", rule: "...", message: "Você deve usar o spread operator (...)" },
        { type: "contains", rule: "console.log", message: "Você deve exibir o resultado no console" },
    ],
    "js-primeiro-alert": [
        { type: "contains", rule: "alert(", message: "Use alert() para mostrar o alerta" },
        { type: "contains", rule: "Bem-vindo ao JavaScript!", message: "A mensagem do alerta deve ser 'Bem-vindo ao JavaScript!'" },
    ],
};

const INSTRUCTION_OVERRIDES = {
    "javascript-objetos-pessoa":
        "Crie um objeto chamado `pessoa` com as propriedades: `nome` (string), `idade` (número) e `cidade` (string). Depois, use `console.log()` com template literal para exibir uma frase no formato: 'Meu nome é NOME, tenho IDADE anos e moro em CIDADE' (substituindo pelos valores do objeto).\n**AVISO:** os resultados serão exibidos na aba de console do navegador (abra as ferramentas de desenvolvedor e vá até a aba 'Console').",
    "javascript-tipos-primitivos":
        "Crie 5 variáveis diferentes que armazenem cada um dos tipos primitivos do JavaScript: string, number, boolean, null e undefined. Não é necessário escrever os nomes dos tipos no código — basta criar os valores. Use console.log() para exibir o valor de cada uma dessas variáveis.\n**AVISO:** os resultados serão exibidos na aba de console do navegador (abra as ferramentas de desenvolvedor e vá até a aba 'Console').",
    "javascript-funcao-com-retorno-soma":
        "Crie uma função chamada **somar** que receba dois números como parâmetros e retorne o resultado da soma. Depois, armazene o valor retornado em uma variável (qualquer nome) e use console.log() para exibir esse valor no console.\n**AVISO:** os resultados serão exibidos na aba de console do navegador (abra as ferramentas de desenvolvedor e vá até a aba 'Console').",
    "javascript-arrow-function":
        "Crie uma arrow function chamada **multiplicar** que receba dois números como parâmetros e retorne o resultado da multiplicação. Em seguida, armazene o valor retornado em uma variável (qualquer nome) e exiba esse valor no console com console.log().\n**AVISO:** os resultados serão exibidos na aba de console do navegador (abra as ferramentas de desenvolvedor e vá até a aba 'Console').",
    "js-consumo-api-async-await":
        "Crie uma função assíncrona que faça uma requisição à API pública https://jsonplaceholder.typicode.com/users usando fetch com async/await. Depois, exiba no console os nomes e e-mails dos usuários retornados pela API. try/catch é opcional.\n**AVISO:** os resultados serão exibidos na aba de console do navegador (abra as ferramentas de desenvolvedor e vá até a aba 'Console').",
    "js-api-detalhes-usuario":
        "Crie uma função assíncrona que receba manualmente um ID de usuário (1 a 10) como parâmetro e faça uma requisição à API https://jsonplaceholder.typicode.com/users/{id} usando fetch com async/await. Depois, exiba no console o nome, e-mail e endereço (rua e cidade) do usuário retornado. try/catch é opcional.\n**AVISO:** os resultados serão exibidos na aba de console do navegador (abra as ferramentas de desenvolvedor e vá até a aba 'Console').",
    "js-api-posts":
        "Crie uma função assíncrona que faça uma requisição à API https://jsonplaceholder.typicode.com/posts usando fetch com async/await. Depois, exiba no console o título e o corpo dos primeiros 5 posts retornados. try/catch é opcional.\n**AVISO:** os resultados serão exibidos na aba de console do navegador (abra as ferramentas de desenvolvedor e vá até a aba 'Console').",
};

const sql = postgres(process.env.DATABASE_URL, { prepare: false });
const rows = await sql`
  SELECT id, data
  FROM exercises
  WHERE lower(coalesce(data->>'category', '')) = 'javascript'
     OR coalesce(data->>'id', id) ILIKE 'javascript%'
     OR coalesce(data->>'id', id) ILIKE 'js-%'
`;

let updated = 0;
for (const row of rows) {
    const data = typeof row.data === "object" && row.data !== null ? { ...row.data } : {};
    const eid = data.id || String(row.id).replace(/^exercises\//, "");
    const sol = parseSolution(data.solutionCode);
    let changed = false;

    if (!sol.javascript.trim()) {
        const fromScript = extractScript(sol.html);
        if (fromScript) {
            sol.javascript = fromScript;
            // Mantém HTML só se for mais do que um wrapper de script
            const htmlWithoutScript = String(sol.html)
                .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
                .replace(/\s+/g, " ")
                .trim();
            if (!htmlWithoutScript || htmlWithoutScript === "<!DOCTYPE html><html><head></head><body></body></html>") {
                sol.html = "";
            } else if (/^\s*<script[\s>]/i.test(sol.html.trim()) && /<\/script>\s*$/i.test(sol.html.trim())) {
                sol.html = "";
            }
            changed = true;
        }
    }

    if (RULE_OVERRIDES[eid]) {
        data.validationRules = RULE_OVERRIDES[eid];
        changed = true;
    }

    if (INSTRUCTION_OVERRIDES[eid]) {
        data.instructions = INSTRUCTION_OVERRIDES[eid];
        changed = true;
    }

    data.reviewMode = "ai";
    data.solutionCode = sol;
    data.id = eid;

    if (!changed && data.reviewMode === "ai") {
        // still persist normalized solution + reviewMode
        changed = true;
    }

    await sql`
      UPDATE exercises
      SET data = ${sql.json(data)}
      WHERE id = ${row.id}
    `;
    updated += 1;
    console.log("ok", eid, "jsLen=", sol.javascript.length);
}

console.log("updated=", updated);
await sql.end();
