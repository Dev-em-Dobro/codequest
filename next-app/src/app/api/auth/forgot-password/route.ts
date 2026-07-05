import { NextResponse } from "next/server";
import { storage } from "@/lib/server/deps";
import { resolveAppBaseUrl } from "@/lib/server/app-url";
import { sendResetPasswordEmail } from "@/lib/server/email";
import { parseJsonBody, internalError } from "@/lib/server/http";
import {
    generatePasswordResetToken,
    getPasswordResetExpiry,
    hashPasswordResetToken,
} from "@/lib/server/password";
import { enforceRateLimit } from "@/lib/server/rate-limit";

export const runtime = "nodejs";

type ForgotPasswordPayload = {
    email?: unknown;
};

function asTrimmedString(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

const SUCCESS_MESSAGE =
    "Se este e-mail existir no sistema, você receberá um link para redefinir sua senha.";

export async function POST(request: Request) {
    try {
        const limited = enforceRateLimit(request, {
            id: "auth-forgot-password",
            windowMs: 15 * 60 * 1000,
            max: 5,
            message: "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
        });

        if (limited) {
            return limited;
        }

        const body = await parseJsonBody<ForgotPasswordPayload>(request);
        const email = asTrimmedString(body.email).toLowerCase();

        if (!email || !isValidEmail(email)) {
            return NextResponse.json({ message: "Digite um e-mail válido" }, { status: 400 });
        }

        const user = await storage.getUserByEmail(email);

        if (user) {
            const token = generatePasswordResetToken();
            const tokenHash = hashPasswordResetToken(token);
            const expiresAt = getPasswordResetExpiry();

            await storage.setPasswordResetToken(user.id, tokenHash, expiresAt);

            const resetUrl = `${resolveAppBaseUrl()}/auth/reset-password?token=${encodeURIComponent(token)}`;

            await sendResetPasswordEmail({
                to: user.email,
                name: user.name,
                resetUrl,
            });
        }

        return NextResponse.json({ message: SUCCESS_MESSAGE });
    } catch (error) {
        return internalError(error, { route: "auth-forgot-password" });
    }
}
