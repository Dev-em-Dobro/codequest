import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getSessionToken, SESSION_TTL_MS, setSessionCookie } from "./auth";
import { storage } from "./storage";
import type { User } from "./storage-types";
import { toPublicUser } from "./user-contract";

const TOKEN_BYTES = 32;

/** Token opaco e aleatório. Só o hash (sha256) vai para o banco. */
export function generateOpaqueToken(): string {
    return randomBytes(TOKEN_BYTES).toString("hex");
}

export function hashOpaqueToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
}

/**
 * Cria uma sessão nova e devolve a resposta de login: `{ sessionId, user }` + cookie httpOnly.
 * O cliente guarda o mesmo token (sessionId) para mandar como Bearer.
 */
export async function respondWithNewSession(user: User): Promise<NextResponse> {
    const token = generateOpaqueToken();
    await storage.createSession(user.id, hashOpaqueToken(token), new Date(Date.now() + SESSION_TTL_MS));

    const response = NextResponse.json({ sessionId: token, user: toPublicUser(user) });
    setSessionCookie(response, token);
    return response;
}

export async function endSession(request: Request): Promise<void> {
    const token = getSessionToken(request);
    if (token) {
        await storage.deleteSession(hashOpaqueToken(token));
    }
}

/** Resolve o usuário da sessão. Devolve null se não houver token ou se ele for inválido/expirado. */
export async function getCurrentUserId(request: Request): Promise<string | null> {
    const token = getSessionToken(request);
    if (!token) {
        return null;
    }

    return storage.getSessionUserId(hashOpaqueToken(token));
}

/** E-mails com acesso de admin, separados por vírgula na env ADMIN_EMAILS. */
function getAdminEmails(): Set<string> {
    return new Set(
        (process.env.ADMIN_EMAILS ?? "")
            .split(",")
            .map((email) => email.trim().toLowerCase())
            .filter(Boolean),
    );
}

export function isAdminEmail(email: string | undefined): boolean {
    if (!email) {
        return false;
    }

    return getAdminEmails().has(email.trim().toLowerCase());
}

type AdminCheck = { ok: true; admin: User } | { ok: false; response: NextResponse };

export async function requireAdmin(request: Request): Promise<AdminCheck> {
    const userId = await getCurrentUserId(request);
    if (!userId) {
        return { ok: false, response: NextResponse.json({ error: "Não autorizado" }, { status: 401 }) };
    }

    const user = await storage.getUser(userId);
    if (!user || !isAdminEmail(user.email)) {
        return {
            ok: false,
            response: NextResponse.json({ error: "Acesso restrito a administradores" }, { status: 403 }),
        };
    }

    return { ok: true, admin: user };
}
