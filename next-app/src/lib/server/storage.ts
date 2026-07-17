import postgres from "postgres";
import { randomBytes, randomUUID } from "node:crypto";
import { hashPasswordResetToken, isPasswordResetExpired } from "./password";
import type {
    Exercise,
    InsertExercise,
    InsertUser,
    InsertUserProgress,
    UpdateCode,
    User,
    UserProgress,
} from "./storage-types";

export interface IStorage {
    getExercises(): Promise<Exercise[]>;
    getExercise(id: string): Promise<Exercise | undefined>;
    createExercise(exercise: InsertExercise & { id?: string }): Promise<Exercise>;
    updateExercise(id: string, data: Partial<InsertExercise>): Promise<Exercise>;
    deleteExercise(id: string): Promise<void>;
    getUserProgress(userId: string): Promise<UserProgress[]>;
    getExerciseProgress(userId: string, exerciseId: string): Promise<UserProgress | undefined>;
    updateUserProgress(userId: string, exerciseId: string, data: Partial<UserProgress>): Promise<UserProgress>;
    createUserProgress(progress: InsertUserProgress & { id?: string }): Promise<UserProgress>;
    getUser(id: string): Promise<User | undefined>;
    getAllUsers(): Promise<User[]>;
    getUserByEmail(email: string): Promise<User | undefined>;
    createUser(user: InsertUser & { id?: string; passwordHash?: string }): Promise<User>;
    updateUser(id: string, data: Partial<User>): Promise<User>;
    getUserPasswordHash(userId: string): Promise<string | null>;
    setUserPasswordHash(userId: string, passwordHash: string): Promise<void>;
    setPasswordResetToken(userId: string, tokenHash: string, expiresAt: string): Promise<void>;
    findUserByPasswordResetToken(token: string): Promise<User | undefined>;
    clearPasswordResetToken(userId: string): Promise<void>;
    updateCode(userId: string, data: UpdateCode): Promise<UserProgress>;
    createFeedback(data: {
        feedback: string;
        userId: string;
        userEmail: string;
        userName: string;
        status?: string;
    }): Promise<void>;
}

const DATABASE_URL = process.env.DATABASE_URL ?? "postgres://user:pass@127.0.0.1:5432/codequest_placeholder";
const HAS_DATABASE_URL = Boolean(process.env.DATABASE_URL);

const sql = postgres(DATABASE_URL, { prepare: false });

function ensureDatabaseConfigured(): void {
    if (!HAS_DATABASE_URL) {
        throw new Error("DATABASE_URL environment variable is required. Please set it in your .env file.");
    }
}

type DbRow = {
    id: string;
    parent_id: string | null;
    data: unknown;
};

type JsonObject = Record<string, unknown>;

function asJson(value: JsonObject) {
    return sql.json(value as unknown as Parameters<typeof sql.json>[0]);
}

function normalizeJsonData(value: unknown): JsonObject {
    if (!value) return {};

    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value) as unknown;
            return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as JsonObject) : {};
        } catch {
            return {};
        }
    }

    if (typeof value === "object" && !Array.isArray(value)) {
        return value as JsonObject;
    }

    return {};
}

function stripPrefix(value: string, prefix: string): string {
    return value.startsWith(`${prefix}/`) ? value.slice(prefix.length + 1) : value;
}

function nowIso(): string {
    return new Date().toISOString();
}

function makeId(size = 20): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const bytes = randomBytes(size);
    let out = "";
    for (let i = 0; i < size; i += 1) {
        out += chars[bytes[i] % chars.length];
    }
    return out;
}

function toNumber(value: unknown, fallback = 0): number {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
}

function toStringSafe(value: unknown, fallback = ""): string {
    return typeof value === "string" ? value : fallback;
}

function getMaxCodeCharsPerLanguage(): number {
    const parsed = Number(process.env.MAX_CODE_CHARS_PER_LANGUAGE ?? "20000");
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return 20000;
    }
    return Math.floor(parsed);
}

const MAX_CODE_CHARS_PER_LANGUAGE = getMaxCodeCharsPerLanguage();

function clampCodeField(value: unknown): string {
    if (typeof value !== "string") {
        return "";
    }

    if (value.length <= MAX_CODE_CHARS_PER_LANGUAGE) {
        return value;
    }

    return value.slice(0, MAX_CODE_CHARS_PER_LANGUAGE);
}

function normalizeUserCode(value: unknown): { html: string; css: string; javascript: string } {
    const candidate = value && typeof value === "object" && !Array.isArray(value) ? (value as JsonObject) : {};

    return {
        html: clampCodeField(candidate.html),
        css: clampCodeField(candidate.css),
        javascript: clampCodeField(candidate.javascript),
    };
}

function areUserCodesEqual(
    a: { html: string; css: string; javascript: string },
    b: { html: string; css: string; javascript: string },
): boolean {
    return a.html === b.html && a.css === b.css && a.javascript === b.javascript;
}

function mapUser(row: DbRow): User {
    const data = normalizeJsonData(row.data);
    const bareId = stripPrefix(row.id, "users");
    const totalPoints = toNumber(data.totalPoints ?? data.points, 0);
    const completedExercises = toNumber(data.completedExercises, 0);

    return {
        id: bareId,
        name: toStringSafe(data.name, "Usuário"),
        email: toStringSafe(data.email),
        totalPoints,
        completedExercises,
        avatar: typeof data.avatar === "string" ? data.avatar : undefined,
        description: typeof data.description === "string" ? data.description : undefined,
        github: typeof data.github === "string" ? data.github : undefined,
        linkedin: typeof data.linkedin === "string" ? data.linkedin : undefined,
    };
}

function mapExercise(row: DbRow): Exercise {
    const data = normalizeJsonData(row.data);
    const bareId = typeof data.id === "string" && data.id ? data.id : stripPrefix(row.id, "exercises");

    return {
        id: bareId,
        title: toStringSafe(data.title),
        description: toStringSafe(data.description),
        instructions: toStringSafe(data.instructions),
        difficulty: (data.difficulty as Exercise["difficulty"]) ?? "iniciante",
        category: (data.category as Exercise["category"]) ?? "html",
        points: toNumber(data.points, 10),
        order: toNumber(data.order, 0),
        initialCode: normalizeUserCode(data.initialCode),
        starterTemplate: normalizeUserCode(data.starterTemplate),
        solutionCode: normalizeUserCode(data.solutionCode),
        hints: Array.isArray(data.hints) ? (data.hints as string[]) : [],
        validationRules: Array.isArray(data.validationRules)
            ? (data.validationRules as Array<{ type: string; rule: string; message: string; count?: number }>)
            : [],
        tests: Array.isArray(data.tests) ? (data.tests as string[]) : [],
    };
}

function mapProgress(row: DbRow): UserProgress {
    const data = normalizeJsonData(row.data);
    const fallbackId = stripPrefix(row.id, "user_progress");

    return {
        id: toStringSafe(data.id, fallbackId),
        userId: toStringSafe(data.userId),
        exerciseId: toStringSafe(data.exerciseId),
        completed: Boolean(data.completed),
        userCode: normalizeUserCode(data.userCode),
        attempts: toNumber(data.attempts, 0),
        pointsEarned: toNumber(data.pointsEarned, 0),
        completedAt: (data.completedAt as string | null | undefined) ?? null,
        createdAt: data.createdAt as string | undefined,
        updatedAt: data.updatedAt as string | undefined,
    };
}

export class NeonJsonStorage implements IStorage {
    private normalizeUserId(userId: string): string {
        return stripPrefix(userId, "users");
    }

    async getUser(id: string): Promise<User | undefined> {
        ensureDatabaseConfigured();
        const bareId = this.normalizeUserId(id);
        const rowId = `users/${bareId}`;

        const rows = await sql<DbRow[]>`
      SELECT id, parent_id, data
      FROM users
      WHERE id = ${id}
         OR id = ${rowId}
         OR split_part(id, '/', 2) = ${bareId}
         OR data->>'id' = ${bareId}
      LIMIT 1
    `;

        if (!rows[0]) return undefined;
        return mapUser(rows[0]);
    }

    async getAllUsers(): Promise<User[]> {
        ensureDatabaseConfigured();
        const rows = await sql<DbRow[]>`SELECT id, parent_id, data FROM users`;
        return rows.map(mapUser);
    }

    async getUserByEmail(email: string): Promise<User | undefined> {
        ensureDatabaseConfigured();
        const normalized = email.toLowerCase().trim();
        const rows = await sql<DbRow[]>`
      SELECT id, parent_id, data
      FROM users
      WHERE lower(data->>'email') = ${normalized}
      LIMIT 1
    `;
        if (!rows[0]) return undefined;
        return mapUser(rows[0]);
    }

    async getUserPasswordHash(userId: string): Promise<string | null> {
        ensureDatabaseConfigured();
        const existing = await this.getUser(userId);
        if (!existing) {
            return null;
        }

        const rowId = `users/${existing.id}`;
        const currentRows = await sql<DbRow[]>`SELECT id, parent_id, data FROM users WHERE id = ${rowId} LIMIT 1`;
        const currentData = normalizeJsonData(currentRows[0]?.data);
        const hash = currentData.passwordHash;

        return typeof hash === "string" && hash.length > 0 ? hash : null;
    }

    async setUserPasswordHash(userId: string, passwordHash: string): Promise<void> {
        ensureDatabaseConfigured();
        const existing = await this.getUser(userId);
        if (!existing) {
            throw new Error("User not found");
        }

        const rowId = `users/${existing.id}`;
        const currentRows = await sql<DbRow[]>`SELECT id, parent_id, data FROM users WHERE id = ${rowId} LIMIT 1`;
        const currentData = normalizeJsonData(currentRows[0]?.data);
        const merged: JsonObject = {
            ...currentData,
            passwordHash,
        };

        await sql`
      UPDATE users
      SET data = ${asJson(merged)}
      WHERE id = ${rowId}
    `;
    }

    async setPasswordResetToken(userId: string, tokenHash: string, expiresAt: string): Promise<void> {
        ensureDatabaseConfigured();
        const existing = await this.getUser(userId);
        if (!existing) {
            throw new Error("User not found");
        }

        const rowId = `users/${existing.id}`;
        const currentRows = await sql<DbRow[]>`SELECT id, parent_id, data FROM users WHERE id = ${rowId} LIMIT 1`;
        const currentData = normalizeJsonData(currentRows[0]?.data);
        const merged: JsonObject = {
            ...currentData,
            passwordResetTokenHash: tokenHash,
            passwordResetExpires: expiresAt,
        };

        await sql`
      UPDATE users
      SET data = ${asJson(merged)}
      WHERE id = ${rowId}
    `;
    }

    async findUserByPasswordResetToken(token: string): Promise<User | undefined> {
        ensureDatabaseConfigured();
        const tokenHash = hashPasswordResetToken(token);

        const rows = await sql<DbRow[]>`
      SELECT id, parent_id, data
      FROM users
      WHERE data->>'passwordResetTokenHash' = ${tokenHash}
      LIMIT 1
    `;

        if (!rows[0]) {
            return undefined;
        }

        const data = normalizeJsonData(rows[0].data);
        if (isPasswordResetExpired(typeof data.passwordResetExpires === "string" ? data.passwordResetExpires : undefined)) {
            return undefined;
        }

        return mapUser(rows[0]);
    }

    async clearPasswordResetToken(userId: string): Promise<void> {
        ensureDatabaseConfigured();
        const existing = await this.getUser(userId);
        if (!existing) {
            return;
        }

        const rowId = `users/${existing.id}`;
        const currentRows = await sql<DbRow[]>`SELECT id, parent_id, data FROM users WHERE id = ${rowId} LIMIT 1`;
        const currentData = normalizeJsonData(currentRows[0]?.data);
        const merged: JsonObject = { ...currentData };
        delete merged.passwordResetTokenHash;
        delete merged.passwordResetExpires;

        await sql`
      UPDATE users
      SET data = ${asJson(merged)}
      WHERE id = ${rowId}
    `;
    }

    async createUser(user: InsertUser & { id?: string; passwordHash?: string }): Promise<User> {
        ensureDatabaseConfigured();
        const bareId = this.normalizeUserId(user.id ?? makeId(28));
        const rowId = `users/${bareId}`;
        const points = toNumber(user.totalPoints ?? 0, 0);
        const completedExercises = toNumber(user.completedExercises ?? 0, 0);

        const payload: JsonObject = {
            name: user.name,
            email: user.email,
            createdAt: nowIso(),
            points,
            level: Math.floor(points / 100) + 1,
            totalPoints: points,
            completedExercises,
        };

        if (user.passwordHash) {
            payload.passwordHash = user.passwordHash;
        }

        const rows = await sql<DbRow[]>`
      INSERT INTO users (id, parent_id, data)
    VALUES (${rowId}, NULL, ${asJson(payload)})
      ON CONFLICT (id) DO UPDATE
      SET data = EXCLUDED.data
      RETURNING id, parent_id, data
    `;

        return mapUser(rows[0]);
    }

    async updateUser(id: string, data: Partial<User>): Promise<User> {
        ensureDatabaseConfigured();
        const existing = await this.getUser(id);
        if (!existing) {
            throw new Error("User not found");
        }

        const rowId = `users/${existing.id}`;
        const currentRows = await sql<DbRow[]>`SELECT id, parent_id, data FROM users WHERE id = ${rowId} LIMIT 1`;
        const currentData = normalizeJsonData(currentRows[0]?.data);
        const merged: JsonObject = { ...currentData };

        if (data.name !== undefined) merged.name = data.name;
        if (data.email !== undefined) merged.email = data.email;
        if (data.description !== undefined) merged.description = data.description;
        if (data.avatar !== undefined) merged.avatar = data.avatar;
        if (data.github !== undefined) merged.github = data.github;
        if (data.linkedin !== undefined) merged.linkedin = data.linkedin;
        if (data.totalPoints !== undefined) {
            const totalPoints = toNumber(data.totalPoints, 0);
            merged.totalPoints = totalPoints;
            merged.points = totalPoints;
            merged.level = Math.floor(totalPoints / 100) + 1;
        }
        if (data.completedExercises !== undefined) {
            merged.completedExercises = toNumber(data.completedExercises, 0);
        }

        const rows = await sql<DbRow[]>`
      UPDATE users
    SET data = ${asJson(merged)}
      WHERE id = ${rowId}
      RETURNING id, parent_id, data
    `;

        if (!rows[0]) {
            throw new Error("User not found after update");
        }

        return mapUser(rows[0]);
    }

    async getExercises(): Promise<Exercise[]> {
        ensureDatabaseConfigured();
        const rows = await sql<DbRow[]>`
      SELECT id, parent_id, data
      FROM exercises
      ORDER BY COALESCE((data->>'order')::int, 999999), id
    `;
        return rows.map(mapExercise);
    }

    async getExercise(id: string): Promise<Exercise | undefined> {
        ensureDatabaseConfigured();
        const bareId = stripPrefix(id, "exercises");
        const rowId = `exercises/${bareId}`;

        const rows = await sql<DbRow[]>`
      SELECT id, parent_id, data
      FROM exercises
      WHERE id = ${id}
         OR id = ${rowId}
         OR split_part(id, '/', 2) = ${bareId}
         OR data->>'id' = ${bareId}
      LIMIT 1
    `;

        if (!rows[0]) return undefined;
        return mapExercise(rows[0]);
    }

    async createExercise(exercise: InsertExercise & { id?: string }): Promise<Exercise> {
        ensureDatabaseConfigured();
        const bareId = stripPrefix(exercise.id ?? randomUUID(), "exercises");
        const rowId = `exercises/${bareId}`;
        const payload: JsonObject = {
            ...exercise,
            id: bareId,
            difficulty: exercise.difficulty ?? "iniciante",
            category: exercise.category ?? "html",
            points: exercise.points ?? 10,
            initialCode: exercise.initialCode ?? { html: "", css: "", javascript: "" },
            starterTemplate: exercise.starterTemplate ?? { html: "", css: "", javascript: "" },
            solutionCode: exercise.solutionCode ?? { html: "", css: "", javascript: "" },
            hints: Array.isArray(exercise.hints) ? exercise.hints : [],
            validationRules: Array.isArray(exercise.validationRules) ? exercise.validationRules : [],
            tests: Array.isArray(exercise.tests) ? exercise.tests : [],
        };

        const rows = await sql<DbRow[]>`
      INSERT INTO exercises (id, parent_id, data)
    VALUES (${rowId}, NULL, ${asJson(payload)})
      ON CONFLICT (id) DO UPDATE
      SET data = EXCLUDED.data
      RETURNING id, parent_id, data
    `;

        return mapExercise(rows[0]);
    }

    async updateExercise(id: string, data: Partial<InsertExercise>): Promise<Exercise> {
        ensureDatabaseConfigured();
        const existing = await this.getExercise(id);
        if (!existing) {
            throw new Error(`Exercise not found: ${id}`);
        }

        return this.createExercise({
            ...existing,
            ...data,
            id: existing.id,
        });
    }

    async deleteExercise(id: string): Promise<void> {
        ensureDatabaseConfigured();
        const bareId = stripPrefix(id, "exercises");
        const rowId = `exercises/${bareId}`;
        await sql`
      DELETE FROM exercises
      WHERE id = ${id}
         OR id = ${rowId}
         OR split_part(id, '/', 2) = ${bareId}
    `;
    }

    async getUserProgress(userId: string): Promise<UserProgress[]> {
        ensureDatabaseConfigured();
        const bareUserId = this.normalizeUserId(userId);
        const likePattern = `user_progress/${bareUserId}_%`;

        const rows = await sql<DbRow[]>`
      SELECT id, parent_id, data
      FROM user_progress
      WHERE jsonb_typeof(data) = 'object'
        AND (
          id LIKE ${likePattern}
          OR data->>'userId' = ${bareUserId}
        )
    `;

        return rows.map(mapProgress);
    }

    async getExerciseProgress(userId: string, exerciseId: string): Promise<UserProgress | undefined> {
        ensureDatabaseConfigured();
        const bareUserId = this.normalizeUserId(userId);
        const bareExerciseId = stripPrefix(exerciseId, "exercises");
        const docId = `${bareUserId}_${bareExerciseId}`;
        const rowId = `user_progress/${docId}`;

        const rows = await sql<DbRow[]>`
      SELECT id, parent_id, data
      FROM user_progress
      WHERE jsonb_typeof(data) = 'object'
        AND (
          id = ${rowId}
          OR id = ${docId}
          OR data->>'id' = ${docId}
          OR (data->>'userId' = ${bareUserId} AND data->>'exerciseId' = ${bareExerciseId})
        )
      LIMIT 1
    `;

        if (!rows[0]) return undefined;
        return mapProgress(rows[0]);
    }

    async createUserProgress(progress: InsertUserProgress & { id?: string }): Promise<UserProgress> {
        ensureDatabaseConfigured();
        const bareUserId = this.normalizeUserId(progress.userId);
        const bareExerciseId = stripPrefix(progress.exerciseId, "exercises");
        const docId = progress.id ? stripPrefix(progress.id, "user_progress") : `${bareUserId}_${bareExerciseId}`;
        const rowId = `user_progress/${docId}`;
        const timestamp = nowIso();

        const payload: JsonObject = {
            id: docId,
            userId: bareUserId,
            exerciseId: bareExerciseId,
            completed: progress.completed ?? false,
            attempts: progress.attempts ?? 0,
            pointsEarned: progress.pointsEarned ?? 0,
            userCode: normalizeUserCode(progress.userCode),
            createdAt: timestamp,
        };

        if (progress.completedAt !== undefined) {
            payload.completedAt = progress.completedAt;
        }

        const rows = await sql<DbRow[]>`
      INSERT INTO user_progress (id, parent_id, data)
    VALUES (${rowId}, NULL, ${asJson(payload)})
      ON CONFLICT (id) DO UPDATE
      SET data = EXCLUDED.data
      RETURNING id, parent_id, data
    `;

        return mapProgress(rows[0]);
    }

    async updateUserProgress(userId: string, exerciseId: string, data: Partial<UserProgress>): Promise<UserProgress> {
        ensureDatabaseConfigured();
        const existing = await this.getExerciseProgress(userId, exerciseId);

        if (!existing) {
            const initial: InsertUserProgress & { id?: string } = {
                id: `${this.normalizeUserId(userId)}_${stripPrefix(exerciseId, "exercises")}`,
                userId,
                exerciseId,
                completed: false,
                attempts: 0,
                pointsEarned: 0,
                userCode: { html: "", css: "", javascript: "" },
            };
            const created = await this.createUserProgress(initial);
            return this.updateUserProgress(created.userId, created.exerciseId, data);
        }

        const rowId = `user_progress/${existing.id}`;
        const currentRows = await sql<DbRow[]>`SELECT id, parent_id, data FROM user_progress WHERE id = ${rowId} LIMIT 1`;
        const currentData = normalizeJsonData(currentRows[0]?.data);

        const merged: JsonObject = {
            ...currentData,
            ...data,
            userId: this.normalizeUserId(userId),
            exerciseId: stripPrefix(exerciseId, "exercises"),
            id: existing.id,
            updatedAt: nowIso(),
        };

        if (data.userCode !== undefined) {
            merged.userCode = normalizeUserCode(data.userCode);
        } else if (merged.userCode !== undefined) {
            merged.userCode = normalizeUserCode(merged.userCode);
        }

        if (!merged.createdAt) {
            merged.createdAt = nowIso();
        }

        const rows = await sql<DbRow[]>`
      UPDATE user_progress
    SET data = ${asJson(merged)}
      WHERE id = ${rowId}
      RETURNING id, parent_id, data
    `;

        return mapProgress(rows[0]);
    }

    async updateCode(userId: string, data: UpdateCode): Promise<UserProgress> {
        ensureDatabaseConfigured();
        const existing = await this.getExerciseProgress(userId, data.exerciseId);
        const updatedCode = normalizeUserCode(data.userCode);

        if (existing && areUserCodesEqual(normalizeUserCode(existing.userCode), updatedCode)) {
            return existing;
        }

        return this.updateUserProgress(userId, data.exerciseId, {
            userCode: updatedCode,
            attempts: (existing?.attempts || 0) + 1,
        });
    }

    async createFeedback(data: {
        feedback: string;
        userId: string;
        userEmail: string;
        userName: string;
        status?: string;
    }): Promise<void> {
        ensureDatabaseConfigured();
        const docId = makeId(20);
        const rowId = `feedbacks/${docId}`;
        const payload: JsonObject = {
            feedback: data.feedback,
            userId: this.normalizeUserId(data.userId),
            userEmail: data.userEmail,
            userName: data.userName,
            status: data.status ?? "pending",
            createdAt: nowIso(),
        };

        await sql`
      INSERT INTO feedbacks (id, parent_id, data)
    VALUES (${rowId}, NULL, ${asJson(payload)})
    `;
    }
}

export const storage = new NeonJsonStorage();
