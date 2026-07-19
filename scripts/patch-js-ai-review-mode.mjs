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

/** Todos os JS + o CSS de cores: reviewMode ai no banco (espelha a política ai-first). */
const rows = await sql`
  SELECT id, data
  FROM exercises
  WHERE jsonb_typeof(data) = 'object'
`;

let updated = 0;
for (const row of rows) {
    const data = typeof row.data === "object" && row.data !== null ? { ...row.data } : {};
    const id = data.id || String(row.id).replace(/^exercises\//, "");
    const category = data.category;

    const shouldBeAi =
        category === "javascript" || id === "html-css-cores-fontes-estilizacao-texto";

    if (!shouldBeAi) continue;
    if (data.reviewMode === "ai") continue;

    const nextData = {
        ...data,
        id,
        reviewMode: "ai",
    };

    await sql`
    UPDATE exercises
    SET data = ${sql.json(nextData)}
    WHERE id = ${row.id}
  `;
    updated += 1;
    console.log(`AI: ${id}`);
}

console.log(`Done. Updated ${updated} exercises.`);
await sql.end();
