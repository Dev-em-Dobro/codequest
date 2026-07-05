import { NextResponse } from "next/server";
import { storage } from "@/lib/server/deps";
import { parseJsonBody, internalError } from "@/lib/server/http";
import { hashPassword } from "@/lib/server/password";
import { enforceRateLimit } from "@/lib/server/rate-limit";

export const runtime = "nodejs";

type ResetPasswordPayload = {
    token?: unknown;
    password?: unknown;
};

function asTrimmedString(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
    try {
        const limited = enforceRateLimit(request, {
            id: "auth-reset-password",
            windowMs: 15 * 60 * 1000,
            max: 5,
            message: "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
        });

        if (limited) {
            return limited;
        }

        const body = await parseJsonBody<ResetPasswordPayload>(request);
        const token = asTrimmedString(body.token);
        const password = asTrimmedString(body.password);

        if (!token) {
            return NextResponse.json(
                { message: "Link de redefinição inválido ou expirado." },
                { status: 400 },
            );
        }

        if (!password || password.length < 8) {
            return NextResponse.json(
                { message: "A senha deve ter pelo menos 8 caracteres." },
                { status: 400 },
            );
        }

        if (password.length > 128) {
            return NextResponse.json(
                { message: "A senha deve ter no máximo 128 caracteres." },
                { status: 400 },
            );
        }

        const user = await storage.findUserByPasswordResetToken(token);
        if (!user) {
            return NextResponse.json(
                { message: "Link de redefinição inválido ou expirado." },
                { status: 400 },
            );
        }

        const passwordHash = await hashPassword(password);
        await storage.setUserPasswordHash(user.id, passwordHash);
        await storage.clearPasswordResetToken(user.id);

        return NextResponse.json({ message: "Senha redefinida com sucesso." });
    } catch (error) {
        return internalError(error, { route: "auth-reset-password" });
    }
}
