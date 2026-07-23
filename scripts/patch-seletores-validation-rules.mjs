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

const EXERCISE_ID = "css-seletores-classes-ids";

const NEW_RULES = [
    {
        type: "contains",
        rule: "Eu sou um parágrafo",
        message: "Crie o parágrafo sem atributos com o texto pedido.",
    },
    {
        type: "contains",
        rule: 'class="destaque"',
        message: "Crie o parágrafo com a classe destaque.",
    },
    {
        type: "contains",
        rule: 'id="unico"',
        message: "Crie o parágrafo com o id unico.",
    },
    {
        type: "contains",
        rule: "color: blue",
        message: "O seletor de tag p deve definir a cor azul.",
    },
    {
        type: "contains",
        rule: ".destaque",
        message: "Use o seletor de classe .destaque no CSS.",
    },
    {
        type: "contains",
        rule: "color: green",
        message: "O seletor .destaque deve definir a cor verde.",
    },
    {
        type: "contains",
        rule: "#unico",
        message: "Use o seletor de id #unico no CSS.",
    },
    {
        type: "contains",
        rule: "color: red",
        message: "O seletor #unico deve definir a cor vermelha.",
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
    console.error("Exercise not found");
    await sql.end();
    process.exit(1);
}

const current = typeof rows[0].data === "object" && rows[0].data !== null ? rows[0].data : {};
const nextData = {
    ...current,
    id: EXERCISE_ID,
    reviewMode: "deterministic",
    validationRules: NEW_RULES,
};

await sql`
  UPDATE exercises
  SET data = ${sql.json(nextData)}
  WHERE id = ${rows[0].id}
`;

console.log("Patched", EXERCISE_ID, "→ contains rules + deterministic");
console.log(JSON.stringify(NEW_RULES, null, 2));
await sql.end();
