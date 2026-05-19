import { NextResponse } from "next/server";
import { storage } from "@/lib/server/deps";
import { parseJsonBody, internalError } from "@/lib/server/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request);
    const email = String(body?.email || "").trim();
    const password = String(body?.password || "").trim();

    if (!email || !password) {
      return NextResponse.json({ message: "Email e senha são obrigatórios" }, { status: 400 });
    }

    const user = await storage.getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ message: "Email ou senha inválidos" }, { status: 401 });
    }

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
