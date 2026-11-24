import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/server/auth";
import { endSession } from "@/lib/server/current-user";
import { captureServerError } from "@/lib/server/sentry";

export const runtime = "nodejs";

export async function POST(request: Request) {
    try {
        await endSession(request);
    } catch (error) {
        // Mesmo se apagar a sessão no banco falhar, o cookie é limpo abaixo.
        captureServerError(error, { route: "auth-sign-out" });
    }

    const response = NextResponse.json({ success: true });
    clearSessionCookie(response);
    return response;
}
