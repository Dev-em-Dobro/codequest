import { NextResponse } from "next/server";
import { resolveAppBaseUrl } from "@/lib/server/app-url";
import { generateOpaqueToken, hashOpaqueToken, requireAdmin } from "@/lib/server/current-user";
import { storage } from "@/lib/server/deps";
import { internalError, parseJsonBody } from "@/lib/server/http";
import { enforceRateLimit } from "@/lib/server/rate-limit";

export const runtime = "nodejs";

/** O link vale por 24h e só funciona uma vez. */
const LOGIN_LINK_TTL_MS = 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
    try {
        const limited = enforceRateLimit(request, {
            id: "admin-login-link",
            windowMs: 15 * 60 * 1000,
            max: 30,
            message: "Muitos links gerados em pouco tempo. Aguarde alguns minutos.",
        });

        if (limited) {
            return limited;
        }

        const adminCheck = await requireAdmin(request);
        if (!adminCheck.ok) {
            return adminCheck.response;
        }

        const body = await parseJsonBody<{ email?: unknown }>(request);
        const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
        if (!email) {
            return NextResponse.json({ error: "Informe o e-mail do aluno" }, { status: 400 });
        }

        const student = await storage.getUserByEmail(email);
        if (!student) {
            return NextResponse.json({ error: "Nenhum aluno com esse e-mail no CodeQuest" }, { status: 404 });
        }

        const token = generateOpaqueToken();
        const expiresAt = new Date(Date.now() + LOGIN_LINK_TTL_MS);
        await storage.createLoginLink(student.id, adminCheck.admin.id, hashOpaqueToken(token), expiresAt);

        return NextResponse.json({
            url: `${resolveAppBaseUrl()}/auth/link?token=${encodeURIComponent(token)}`,
            expiresAt: expiresAt.toISOString(),
            student: { name: student.name, email: student.email },
        });
    } catch (error) {
        return internalError(error, { route: "admin-login-link" });
    }
}
