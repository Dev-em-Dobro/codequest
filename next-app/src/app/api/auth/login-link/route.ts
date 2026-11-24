import { NextResponse } from "next/server";
import { hashOpaqueToken, respondWithNewSession } from "@/lib/server/current-user";
import { storage } from "@/lib/server/deps";
import { internalError, parseJsonBody } from "@/lib/server/http";
import { enforceRateLimit } from "@/lib/server/rate-limit";

export const runtime = "nodejs";

const INVALID_LINK_MESSAGE = "Este link de acesso é inválido, expirou ou já foi usado. Peça um novo ao suporte.";

export async function POST(request: Request) {
    try {
        const limited = enforceRateLimit(request, {
            id: "auth-login-link",
            windowMs: 15 * 60 * 1000,
            max: 10,
            message: "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
        });

        if (limited) {
            return limited;
        }

        const body = await parseJsonBody<{ token?: unknown }>(request);
        const token = typeof body.token === "string" ? body.token.trim() : "";
        if (!token) {
            return NextResponse.json({ message: INVALID_LINK_MESSAGE }, { status: 400 });
        }

        const userId = await storage.consumeLoginLink(hashOpaqueToken(token));
        const user = userId ? await storage.getUser(userId) : undefined;
        if (!user) {
            return NextResponse.json({ message: INVALID_LINK_MESSAGE }, { status: 400 });
        }

        return await respondWithNewSession(user);
    } catch (error) {
        return internalError(error, { route: "auth-login-link" });
    }
}
