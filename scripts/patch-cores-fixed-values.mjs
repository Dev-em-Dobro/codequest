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

const EXERCISE_ID = "html-css-cores-fontes-estilizacao-texto";

const NEW_INSTRUCTIONS = `Crie uma página com um título <h1>, um parágrafo e um link. Estilize com CSS usando estes valores fixos:

(1) No <body>, use font-family: Arial, Helvetica, sans-serif.
(2) No <h1>, use o texto "Estilização de Texto" e a cor #2c3e50.
(3) No parágrafo <p>, use a cor #555555 e font-size: 16px.
(4) No link <a>, use text-decoration: none; no estado :hover, use text-decoration: underline.
(5) Dentro do parágrafo, envolva uma palavra com <span class="destaque"> e estilize .destaque com color: #e74c3c, font-weight: bold e text-transform: uppercase.`;

const NEW_HINTS = [
    "Defina no body: font-family: Arial, Helvetica, sans-serif.",
    "O h1 deve ter o texto 'Estilização de Texto' e color: #2c3e50.",
    "O parágrafo deve ter color: #555555 e font-size: 16px.",
    "No link use text-decoration: none e no a:hover use text-decoration: underline.",
    "Use <span class=\"destaque\"> com color: #e74c3c, font-weight: bold e text-transform: uppercase.",
];

const NEW_VALIDATION_RULES = [
    {
        type: "contains",
        rule: "<h1>Estilização de Texto</h1>",
        message: "O título <h1> deve ter o texto 'Estilização de Texto'.",
    },
    {
        type: "contains",
        rule: "class=",
        message: "Inclua um elemento com a classe destaque no parágrafo.",
    },
    {
        type: "contains",
        rule: "destaque",
        message: "Use a classe destaque no HTML e no CSS.",
    },
    {
        type: "contains",
        rule: "font-family",
        message: "Defina font-family no body (Arial, Helvetica, sans-serif).",
    },
    {
        type: "contains",
        rule: "Arial",
        message: "A font-family do body deve incluir Arial.",
    },
    {
        type: "contains",
        rule: "#2c3e50",
        message: "O h1 deve usar a cor #2c3e50.",
    },
    {
        type: "contains",
        rule: "#555555",
        message: "O parágrafo deve usar a cor #555555.",
    },
    {
        type: "contains",
        rule: "font-size: 16px",
        message: "O parágrafo deve usar font-size: 16px.",
    },
    {
        type: "contains",
        rule: "text-decoration: none",
        message: "Remova o sublinhado do link com text-decoration: none.",
    },
    {
        type: "contains",
        rule: "a:hover",
        message: "Use a pseudo-classe a:hover no link.",
    },
    {
        type: "contains",
        rule: "text-decoration: underline",
        message: "No :hover, o link deve ficar sublinhado.",
    },
    {
        type: "contains",
        rule: ".destaque",
        message: "Crie o seletor .destaque no CSS.",
    },
    {
        type: "contains",
        rule: "#e74c3c",
        message: "A classe .destaque deve usar a cor #e74c3c.",
    },
    {
        type: "contains",
        rule: "font-weight: bold",
        message: "A classe .destaque deve usar font-weight: bold.",
    },
    {
        type: "contains",
        rule: "text-transform: uppercase",
        message: "A classe .destaque deve usar text-transform: uppercase.",
    },
];

const sql = postgres(process.env.DATABASE_URL, { prepare: false });

const rows = await sql`
  SELECT id, data
  FROM exercises
  WHERE id = ${EXERCISE_ID}
     OR id = ${"exercises/" + EXERCISE_ID}
     OR split_part(id, '/', 2) = ${EXERCISE_ID}
     OR data->>'id' = ${EXERCISE_ID}
  LIMIT 1
`;

if (!rows[0]) {
    console.error(`Exercise not found: ${EXERCISE_ID}`);
    await sql.end();
    process.exit(1);
}

const current = typeof rows[0].data === "object" && rows[0].data !== null ? rows[0].data : {};
const nextData = {
    ...current,
    id: EXERCISE_ID,
    reviewMode: "deterministic",
    instructions: NEW_INSTRUCTIONS,
    hints: NEW_HINTS,
    validationRules: NEW_VALIDATION_RULES,
};

await sql`
  UPDATE exercises
  SET data = ${sql.json(nextData)}
  WHERE id = ${rows[0].id}
`;

console.log("Updated exercise to fixed values + deterministic review.");
console.log("reviewMode:", nextData.reviewMode);
console.log("instructions preview:", NEW_INSTRUCTIONS.slice(0, 120) + "...");
console.log("rules:", NEW_VALIDATION_RULES.length);
console.log("Note: user_progress.completed is NOT touched — who already finished stays finished.");
await sql.end();
