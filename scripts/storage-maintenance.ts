import postgres from "postgres";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required.");
}

const APPLY_CHANGES = process.env.APPLY_CHANGES === "true";
const RUN_VACUUM = process.env.RUN_VACUUM !== "false";

function parseDays(rawValue: string | undefined): number {
    const parsed = Number(rawValue ?? "0");
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return 0;
    }
    return Math.floor(parsed);
}

const CLEANUP_INCOMPLETE_OLDER_THAN_DAYS = parseDays(
    process.env.CLEANUP_INCOMPLETE_OLDER_THAN_DAYS,
);

const sql = postgres(DATABASE_URL, { prepare: false });

type StorageRow = {
    table_bytes: string;
    index_bytes: string;
    toast_bytes: string;
    total_bytes: string;
};

type CountRow = {
    rows: string;
    data_bytes: string;
};

function toInt(value: string): number {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : 0;
}

function formatBytes(bytes: number): string {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let value = bytes;
    let unitIndex = 0;

    while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024;
        unitIndex += 1;
    }

    return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

async function getUserProgressStorage(): Promise<{ table: number; index: number; toast: number; total: number }> {
    const rows = await sql<StorageRow[]>`
    SELECT
      pg_relation_size('user_progress')::text AS table_bytes,
      pg_indexes_size('user_progress')::text AS index_bytes,
      COALESCE(pg_relation_size((SELECT reltoastrelid FROM pg_class WHERE relname = 'user_progress')), 0)::text AS toast_bytes,
      pg_total_relation_size('user_progress')::text AS total_bytes
  `;

    const row = rows[0];
    return {
        table: toInt(row.table_bytes),
        index: toInt(row.index_bytes),
        toast: toInt(row.toast_bytes),
        total: toInt(row.total_bytes),
    };
}

async function getMalformedProgressStats(): Promise<{ rows: number; bytes: number }> {
    const rows = await sql<CountRow[]>`
    SELECT
      COUNT(*)::text AS rows,
      COALESCE(SUM(pg_column_size(data)), 0)::text AS data_bytes
    FROM user_progress
    WHERE jsonb_typeof(data) <> 'object'
  `;

    return {
        rows: toInt(rows[0].rows),
        bytes: toInt(rows[0].data_bytes),
    };
}

async function getStaleIncompleteStats(days: number): Promise<{ rows: number; bytes: number }> {
    if (days <= 0) {
        return { rows: 0, bytes: 0 };
    }

    const rows = await sql<CountRow[]>`
    SELECT
      COUNT(*)::text AS rows,
      COALESCE(SUM(pg_column_size(data)), 0)::text AS data_bytes
    FROM user_progress
    WHERE jsonb_typeof(data) = 'object'
      AND COALESCE((data->>'completed')::boolean, false) = false
      AND COALESCE(
        NULLIF(data->>'updatedAt', '')::timestamptz,
        NULLIF(data->>'createdAt', '')::timestamptz,
        to_timestamp(0)
      ) < NOW() - make_interval(days => ${days})
  `;

    return {
        rows: toInt(rows[0].rows),
        bytes: toInt(rows[0].data_bytes),
    };
}

async function deleteMalformedProgressRows(): Promise<number> {
    const rows = await sql<{ deleted_rows: string }[]>`
    WITH deleted AS (
      DELETE FROM user_progress
      WHERE jsonb_typeof(data) <> 'object'
      RETURNING 1
    )
    SELECT COUNT(*)::text AS deleted_rows FROM deleted
  `;

    return toInt(rows[0].deleted_rows);
}

async function deleteStaleIncompleteRows(days: number): Promise<number> {
    if (days <= 0) {
        return 0;
    }

    const rows = await sql<{ deleted_rows: string }[]>`
    WITH deleted AS (
      DELETE FROM user_progress
      WHERE jsonb_typeof(data) = 'object'
        AND COALESCE((data->>'completed')::boolean, false) = false
        AND COALESCE(
          NULLIF(data->>'updatedAt', '')::timestamptz,
          NULLIF(data->>'createdAt', '')::timestamptz,
          to_timestamp(0)
        ) < NOW() - make_interval(days => ${days})
      RETURNING 1
    )
    SELECT COUNT(*)::text AS deleted_rows FROM deleted
  `;

    return toInt(rows[0].deleted_rows);
}

async function run(): Promise<void> {
    const beforeStorage = await getUserProgressStorage();
    const malformed = await getMalformedProgressStats();
    const staleIncomplete = await getStaleIncompleteStats(CLEANUP_INCOMPLETE_OLDER_THAN_DAYS);

    console.log("\n== Neon Storage Audit (user_progress) ==");
    console.log(`Mode: ${APPLY_CHANGES ? "APPLY_CHANGES=true" : "DRY RUN"}`);
    console.log(`Total table size: ${formatBytes(beforeStorage.total)}`);
    console.log(`- Heap: ${formatBytes(beforeStorage.table)}`);
    console.log(`- TOAST: ${formatBytes(beforeStorage.toast)}`);
    console.log(`- Indexes: ${formatBytes(beforeStorage.index)}`);
    console.log(`Malformed rows (data is not object): ${malformed.rows} (${formatBytes(malformed.bytes)})`);

    if (CLEANUP_INCOMPLETE_OLDER_THAN_DAYS > 0) {
        console.log(
            `Stale incomplete rows (>${CLEANUP_INCOMPLETE_OLDER_THAN_DAYS} days): ${staleIncomplete.rows} (${formatBytes(staleIncomplete.bytes)})`,
        );
    } else {
        console.log("Stale incomplete cleanup: disabled (set CLEANUP_INCOMPLETE_OLDER_THAN_DAYS to enable)");
    }

    if (!APPLY_CHANGES) {
        console.log("\nNo data changed. To apply cleanup, run with APPLY_CHANGES=true.");
        return;
    }

    const deletedMalformed = await deleteMalformedProgressRows();
    const deletedStale = await deleteStaleIncompleteRows(CLEANUP_INCOMPLETE_OLDER_THAN_DAYS);

    if (RUN_VACUUM) {
        await sql.unsafe("VACUUM (ANALYZE) user_progress");
    }

    const afterStorage = await getUserProgressStorage();

    console.log("\n== Cleanup Summary ==");
    console.log(`Deleted malformed rows: ${deletedMalformed}`);
    console.log(`Deleted stale incomplete rows: ${deletedStale}`);
    console.log(`Vacuum executed: ${RUN_VACUUM ? "yes" : "no"}`);
    console.log(`Table size before: ${formatBytes(beforeStorage.total)}`);
    console.log(`Table size after:  ${formatBytes(afterStorage.total)}`);

    const reclaimed = beforeStorage.total - afterStorage.total;
    console.log(`Reclaimed now: ${reclaimed > 0 ? formatBytes(reclaimed) : "0 B"}`);
}

run()
    .catch((error) => {
        console.error("Storage maintenance failed:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await sql.end();
    });
