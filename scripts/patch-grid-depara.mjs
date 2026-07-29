import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const envPath = path.join(root, "next-app", ".env");

for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
    }
    if (k && !(k in process.env)) process.env[k] = v;
}

const PATCHES = {
    "css-grid-basico": {
        instructions:
            "Crie um container com display: grid. Defina 3 colunas iguais com 1fr (pode ser 1fr 1fr 1fr ou repeat(3, 1fr)), 2 linhas iguais com 1fr (pode ser 1fr 1fr ou repeat(2, 1fr)) e um espaçamento de 10px entre os itens com gap: 10px.",
        hints: [
            "Use display: grid no container.",
            "Use grid-template-columns com 1fr 1fr 1fr ou repeat(3, 1fr).",
            "Use grid-template-rows com 1fr 1fr ou repeat(2, 1fr).",
            "Adicione gap: 10px para o espaçamento.",
        ],
        validationRules: [
            { type: "contains", rule: "display: grid", message: "O container deve usar display: grid" },
            {
                type: "contains",
                rule: "grid-template-columns: 1fr 1fr 1fr",
                message: "Defina 3 colunas iguais com 1fr (ou repeat(3, 1fr))",
            },
            {
                type: "contains",
                rule: "grid-template-rows: 1fr 1fr",
                message: "Defina 2 linhas iguais com 1fr (ou repeat(2, 1fr))",
            },
            { type: "contains", rule: "gap: 10px", message: "Use gap: 10px entre os itens" },
        ],
    },
    "css-grid-template-columns-rows-gap": {
        instructions:
            "Crie um container com display: grid e adicione 6 divs dentro dele. Configure o grid para ter 3 colunas iguais com 1fr (1fr 1fr 1fr ou repeat(3, 1fr)), 2 linhas de 150px cada (150px 150px ou repeat(2, 150px)) e gap: 20px entre os elementos.",
        hints: [
            "Use display: grid no container.",
            "Defina grid-template-columns com 1fr 1fr 1fr ou repeat(3, 1fr).",
            "Use grid-template-rows com 150px 150px ou repeat(2, 150px).",
            "Adicione gap: 20px para o espaçamento.",
        ],
        validationRules: [
            { type: "contains", rule: "display: grid", message: "O container deve usar display: grid" },
            {
                type: "contains",
                rule: "grid-template-columns: 1fr 1fr 1fr",
                message: "Deve definir 3 colunas iguais com 1fr (ou repeat(3, 1fr))",
            },
            {
                type: "contains",
                rule: "grid-template-rows: 150px 150px",
                message: "Deve definir 2 linhas de 150px (ou repeat(2, 150px))",
            },
            { type: "contains", rule: "gap: 20px", message: "Deve usar um gap de 20px entre os elementos" },
        ],
    },
    "grid-autofill-autofit": {
        instructions:
            "Crie um container com display: grid e pelo menos 6 cards de produtos no HTML. No CSS, use grid-template-columns com repeat(auto-fit, minmax(200px, 1fr)) ou repeat(auto-fill, minmax(200px, 1fr)) para que os cards se ajustem ao tamanho da tela. Cada card deve ser um elemento com class=\"card\" e, dentro dele, um título em <h2>, uma imagem em <img> e uma descrição em <p>.",
        hints: [
            "Use display: grid no container.",
            "Use repeat com auto-fit ou auto-fill e minmax(200px, 1fr).",
            "Cada card no HTML precisa de class=\"card\", com <h2>, <img> e <p> dentro.",
            "Opcional: adicione gap entre os cards para espaçamento.",
        ],
        validationRules: [
            { type: "contains", rule: "display: grid", message: "O container deve ter display: grid" },
            {
                type: "contains",
                rule: "repeat(auto-fit, minmax(200px, 1fr))",
                message: "Use repeat com auto-fit ou auto-fill e minmax(200px, 1fr)",
            },
            { type: "contains", rule: "class=\"card\"", message: "Cada card deve ter a classe card no HTML" },
            { type: "contains", rule: "<img", message: "Cada card deve incluir uma imagem" },
            { type: "contains", rule: "<h2", message: "Cada card deve incluir um título (h2)" },
            { type: "contains", rule: "<p", message: "Cada card deve incluir uma descrição (p)" },
        ],
    },
    "css-grid-area": {
        instructions:
            "Crie um container com display: grid dividido em 3 colunas e 3 linhas (defina grid-template-columns e grid-template-rows). Monte as áreas com grid-template-areas: header na primeira linha inteira, menu na primeira coluna da linha do meio, content nas duas colunas restantes dessa linha, e footer na última linha inteira. Os nomes das áreas devem ser exatamente header, menu, content e footer. Crie cada seção com uma div no HTML e posicione com grid-area.",
        hints: [
            "Use display: grid, grid-template-columns e grid-template-rows.",
            "Use grid-template-areas com as strings header/menu/content/footer.",
            "Cada div deve ter uma classe (header, menu, content, footer) e grid-area correspondente.",
        ],
        validationRules: [
            { type: "contains", rule: "display: grid", message: "O container deve usar display: grid" },
            {
                type: "contains",
                rule: "grid-template-columns",
                message: "Defina grid-template-columns para as 3 colunas",
            },
            {
                type: "contains",
                rule: "grid-template-rows",
                message: "Defina grid-template-rows para as 3 linhas",
            },
            {
                type: "contains",
                rule: "grid-template-areas",
                message: "Deve definir as áreas do grid usando grid-template-areas",
            },
            {
                type: "contains",
                rule: "grid-area: header",
                message: "O header deve ser posicionado usando grid-area: header",
            },
            {
                type: "contains",
                rule: "grid-area: menu",
                message: "O menu deve ser posicionado usando grid-area: menu",
            },
            {
                type: "contains",
                rule: "grid-area: content",
                message: "O conteúdo deve ser posicionado usando grid-area: content",
            },
            {
                type: "contains",
                rule: "grid-area: footer",
                message: "O footer deve ser posicionado usando grid-area: footer",
            },
        ],
    },
};

const sql = postgres(process.env.DATABASE_URL, { prepare: false });

for (const [exerciseId, patch] of Object.entries(PATCHES)) {
    const rows = await sql`
    SELECT id, data
    FROM exercises
    WHERE id = ${exerciseId}
       OR id = ${"exercises/" + exerciseId}
       OR split_part(id, '/', 2) = ${exerciseId}
       OR data->>'id' = ${exerciseId}
    LIMIT 1
  `;

    if (!rows[0]) {
        console.error("Not found:", exerciseId);
        continue;
    }

    const current = typeof rows[0].data === "object" && rows[0].data !== null ? rows[0].data : {};
    const nextData = {
        ...current,
        id: exerciseId,
        reviewMode: "deterministic",
        instructions: patch.instructions,
        hints: patch.hints,
        validationRules: patch.validationRules,
    };

    await sql`
    UPDATE exercises
    SET data = ${sql.json(nextData)}
    WHERE id = ${rows[0].id}
  `;

    console.log("Aligned:", exerciseId, "rules=", patch.validationRules.length);
}

await sql.end();
