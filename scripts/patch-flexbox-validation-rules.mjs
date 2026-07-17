/**
 * Alinha validationRules do exercício css-flexbox-basico ao enunciado
 * (display: flex + justify-content). Não exige align-items, height nem gap.
 *
 * Uso:
 *   DATABASE_URL=... node scripts/patch-flexbox-validation-rules.mjs
 */
import postgres from "postgres";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
    console.error("DATABASE_URL is required.");
    process.exit(1);
}

const EXERCISE_ID = "css-flexbox-basico";

const FLEXBOX_VALIDATION_RULES = [
    {
        type: "contains",
        rule: "display: flex",
        message: "Deve usar 'display: flex' no container.",
    },
    {
        type: "contains",
        rule: "justify-content",
        message: "Use 'justify-content' para alinhar os elementos na horizontal.",
    },
];

const sql = postgres(DATABASE_URL, { prepare: false });

async function main() {
    const bareId = EXERCISE_ID;
    const rowId = `exercises/${bareId}`;

    const rows = await sql`
    SELECT id, data
    FROM exercises
    WHERE id = ${EXERCISE_ID}
       OR id = ${rowId}
       OR split_part(id, '/', 2) = ${bareId}
       OR data->>'id' = ${bareId}
    LIMIT 1
  `;

    if (!rows[0]) {
        console.error(`Exercise not found: ${EXERCISE_ID}`);
        await sql.end();
        process.exit(1);
    }

    const currentData =
        typeof rows[0].data === "object" && rows[0].data !== null ? rows[0].data : {};
    const nextData = {
        ...currentData,
        id: bareId,
        validationRules: FLEXBOX_VALIDATION_RULES,
    };

    await sql`
    UPDATE exercises
    SET data = ${sql.json(nextData)}
    WHERE id = ${rows[0].id}
  `;

    console.log(`Updated validationRules for ${EXERCISE_ID}:`);
    console.log(JSON.stringify(FLEXBOX_VALIDATION_RULES, null, 2));
    await sql.end();
}

main().catch(async (error) => {
    console.error(error);
    await sql.end();
    process.exit(1);
});
