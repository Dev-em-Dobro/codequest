import { NextResponse } from "next/server";
import { storage } from "@/lib/server/deps";
import { parseJsonBody, internalError } from "@/lib/server/http";
import { respondWithNewSession } from "@/lib/server/current-user";
import { enforceRateLimit } from "@/lib/server/rate-limit";
import { hashPassword } from "@/lib/server/password";

export const runtime = "nodejs";

type SignUpPayload = {
    name?: unknown;
    email?: unknown;
    password?: unknown;
};

function asTrimmedString(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
    try {
        const limited = enforceRateLimit(request, {
            id: "auth-sign-up",
            windowMs: 15 * 60 * 1000,
            max: 5,
            message: "Muitas tentativas de cadastro. Tente novamente mais tarde.",
        });

        if (limited) {
            return limited;
        }

        const body = await parseJsonBody<SignUpPayload>(request);
        const name = asTrimmedString(body.name);
        const email = asTrimmedString(body.email);
        const password = asTrimmedString(body.password);

        if (!name || !email || !password) {
            return NextResponse.json({ message: "Todos os campos são obrigatórios" }, { status: 400 });
        }

        if (password.length < 8) {
            return NextResponse.json({ message: "A senha deve ter pelo menos 8 caracteres" }, { status: 400 });
        }

        const existingUser = await storage.getUserByEmail(email);
        if (existingUser) {
            return NextResponse.json({ message: "Este email já está em uso" }, { status: 400 });
        }

        const passwordHash = await hashPassword(password);
        const user = await storage.createUser({ name, email, totalPoints: 0, completedExercises: 0, passwordHash });
        return await respondWithNewSession(user);
    } catch (error) {
        return internalError(error, { route: "auth-sign-up" });
    }
}
