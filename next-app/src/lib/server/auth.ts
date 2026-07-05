import { NextResponse } from "next/server";

export const SESSION_COOKIE_NAME = "codequest_session_id";

/** Sessão expira após 7 dias (cookie httpOnly). */
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

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

export function getCurrentUserId(request: Request): string | null {
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.replace("Bearer ", "").trim();
        if (token) {
            return token;
        }
    }

    return parseSessionIdFromCookie(request.headers.get("cookie"));
}

export function setSessionCookie(response: NextResponse, sessionId: string) {
    response.cookies.set(SESSION_COOKIE_NAME, sessionId, {
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
