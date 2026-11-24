import { NextResponse } from "next/server";

export const SESSION_COOKIE_NAME = "codequest_session_id";

/** Sessão expira após 30 dias (cookie httpOnly + linha em user_sessions). */
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const SESSION_MAX_AGE_SECONDS = SESSION_TTL_MS / 1000;

function parseSessionIdFromCookie(cookieHeader: string | null): string | null {
    if (!cookieHeader) {
        return null;
    }

    const prefix = `${SESSION_COOKIE_NAME}=`;
    const cookieToken = cookieHeader
        .split(";")
        .map((part) => part.trim())
        .find((part) => part.startsWith(prefix));

    if (!cookieToken) {
        return null;
    }

    const value = cookieToken.slice(prefix.length).trim();
    return value || null;
}

/**
 * Lê o token de sessão (opaco) do header Authorization ou do cookie.
 * Não valida nada: use getCurrentUserId (current-user.ts) para resolver o usuário.
 */
export function getSessionToken(request: Request): string | null {
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.replace("Bearer ", "").trim();
        if (token) {
            return token;
        }
    }

    return parseSessionIdFromCookie(request.headers.get("cookie"));
}

export function setSessionCookie(response: NextResponse, sessionToken: string) {
    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: SESSION_MAX_AGE_SECONDS,
    });
}

export function clearSessionCookie(response: NextResponse) {
    response.cookies.set(SESSION_COOKIE_NAME, "", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 0,
    });
}

export function unauthorized(message = "Authentication required"): NextResponse {
    return NextResponse.json({ error: message }, { status: 401 });
}
