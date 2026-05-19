import { NextResponse } from "next/server";

export function getCurrentUserId(request: Request): string | null {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        return null;
    }

    const token = authHeader.replace("Bearer ", "").trim();
    return token || null;
}

export function unauthorized(message = "Authentication required"): NextResponse {
    return NextResponse.json({ error: message }, { status: 401 });
}
