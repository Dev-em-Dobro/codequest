import { NextResponse } from "next/server";
import { storage } from "@/lib/server/deps";
import { parseJsonBody, internalError } from "@/lib/server/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
    try {
        const body = await parseJsonBody(request);
        const name = String(body?.name || "").trim();
        const email = String(body?.email || "").trim();
        const password = String(body?.password || "").trim();

        if (!name || !email || !password) {
            return NextResponse.json({ message: "Todos os campos são obrigatórios" }, { status: 400 });
        }

        const existingUser = await storage.getUserByEmail(email);
        if (existingUser) {
            return NextResponse.json({ message: "Este email já está em uso" }, { status: 400 });
        }

        const user = await storage.createUser({ name, email, totalPoints: 0, completedExercises: 0 });

        return NextResponse.json({
            sessionId: user.id,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                points: user.totalPoints || 0,
                level: Math.floor((user.totalPoints || 0) / 100) + 1,
            },
        });
    } catch {
        return internalError();
    }
}
