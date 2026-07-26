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
    "css-grid-template-columns-rows-gap": [
        {
            type: "contains",
            rule: "display: grid",
            message: "O container deve usar display: grid",
        },
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
        {
            type: "contains",
            rule: "gap: 20px",
            message: "Deve usar um gap de 20px entre os elementos",
        },
    ],
    "grid-autofill-autofit": [
        {
            type: "contains",
            rule: "display: grid",
            message: "O container deve ter display: grid",
        },
        {
            type: "contains",
            rule: "repeat(auto-fit, minmax(200px, 1fr))",
            message: "O grid deve usar repeat com auto-fit ou auto-fill e minmax(200px, 1fr)",
        },
        {
            type: "contains",
            rule: ".card",
            message: "Cada card deve ter a classe .card",
        },
    ],
    "css-grid-basico": [
        {
            type: "contains",
            rule: "grid-template-columns: 1fr 1fr 1fr",
            message: "O container deve ter 3 colunas iguais",
        },
        {
            type: "contains",
            rule: "grid-template-rows: 1fr 1fr",
            message: "O container deve ter 2 linhas iguais",
        },
        {
            type: "contains",
            rule: "gap: 10px",
            message: "O container deve ter espaçamento de 10px entre os itens",
        },
    ],
};

const sql = postgres(process.env.DATABASE_URL, { prepare: false });

for (const [exerciseId, rules] of Object.entries(PATCHES)) {
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
        validationRules: rules,
    };

    await sql`
    UPDATE exercises
    SET data = ${sql.json(nextData)}
    WHERE id = ${rows[0].id}
  `;

    console.log("Patched", exerciseId);
}

await sql.end();
