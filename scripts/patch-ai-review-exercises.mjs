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

const sql = postgres(process.env.DATABASE_URL, { prepare: false });

/** Exercícios de enunciado aberto → reviewMode ai */
const AI_MODE_IDS = ["html-css-cores-fontes-estilizacao-texto"];

/** Soft fixes em regras determinísticas rígidas demais */
const SOFT_RULE_FIXES = {
    "display-inline": (rules) =>
        rules.map((rule) => {
            if (rule?.rule === "margin-right: 20px") {
                return {
                    ...rule,
                    rule: "margin",
                    message: "Deve haver margem entre os itens da lista",
                };
            }
            return rule;
        }),
};

async function findExercise(id) {
    const rows = await sql`
    SELECT id, data
    FROM exercises
    WHERE id = ${id}
       OR id = ${"exercises/" + id}
       OR split_part(id, '/', 2) = ${id}
       OR data->>'id' = ${id}
    LIMIT 1
  `;
    return rows[0] || null;
}

async function updateExercise(row, mutator) {
    const currentData =
        typeof row.data === "object" && row.data !== null ? { ...row.data } : {};
    const nextData = mutator(currentData);
    await sql`
    UPDATE exercises
    SET data = ${sql.json(nextData)}
    WHERE id = ${row.id}
  `;
    return nextData;
}

for (const id of AI_MODE_IDS) {
    const row = await findExercise(id);
    if (!row) {
        console.error(`Not found: ${id}`);
        continue;
    }
    const next = await updateExercise(row, (data) => ({
        ...data,
        id,
        reviewMode: "ai",
        // Regras conceptuais (não usadas no modo ai, mas documentam o enunciado)
        validationRules: [
            { type: "contains", rule: "<h1>", message: "Deve existir um título h1." },
            { type: "contains", rule: "<p>", message: "Deve existir um parágrafo." },
            { type: "contains", rule: "<a", message: "Deve existir um link." },
            { type: "contains", rule: "font-family", message: "Defina font-family no body." },
            { type: "contains", rule: "destaque", message: "Use a classe destaque." },
            { type: "contains", rule: "text-decoration", message: "Controle o sublinhado do link." },
            { type: "contains", rule: ":hover", message: "Use :hover no link." },
            { type: "contains", rule: "text-transform", message: "Use text-transform no destaque." },
            { type: "contains", rule: "font-weight", message: "Use font-weight no destaque." },
        ],
    }));
    console.log(`AI mode: ${id} reviewMode=${next.reviewMode} rules=${next.validationRules.length}`);
}

for (const [id, fix] of Object.entries(SOFT_RULE_FIXES)) {
    const row = await findExercise(id);
    if (!row) {
        console.error(`Not found: ${id}`);
        continue;
    }
    const next = await updateExercise(row, (data) => ({
        ...data,
        id,
        validationRules: fix(Array.isArray(data.validationRules) ? data.validationRules : []),
    }));
    console.log(`Softened: ${id}`);
    console.log(JSON.stringify(next.validationRules, null, 2));
}

await sql.end();
