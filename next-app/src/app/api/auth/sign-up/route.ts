import { NextResponse } from "next/server";
import { storage } from "@/lib/server/deps";
import { parseJsonBody, internalError } from "@/lib/server/http";
import { setSessionCookie } from "@/lib/server/auth";
import { toPublicUser } from "@/lib/server/user-contract";

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
        const body = await parseJsonBody<SignUpPayload>(request);
        const name = asTrimmedString(body.name);
        const email = asTrimmedString(body.email);
        const password = asTrimmedString(body.password);

        if (!name || !email || !password) {
            return NextResponse.json({ message: "Todos os campos são obrigatórios" }, { status: 400 });
        }

        const existingUser = await storage.getUserByEmail(email);
        if (existingUser) {
            return NextResponse.json({ message: "Este email já está em uso" }, { status: 400 });
        }

        const user = await storage.createUser({ name, email, totalPoints: 0, completedExercises: 0 });
        const publicUser = toPublicUser(user);

        const response = NextResponse.json({
            sessionId: user.id,
            user: publicUser,
        });

        setSessionCookie(response, user.id);
        return response;
    } catch {
        return internalError();
    }
}
