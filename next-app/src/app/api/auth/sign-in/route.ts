import { NextResponse } from "next/server";
import { storage } from "@/lib/server/deps";
import { parseJsonBody, internalError } from "@/lib/server/http";
import { setSessionCookie } from "@/lib/server/auth";

export const runtime = "nodejs";

type SignInPayload = {
  email?: unknown;
  password?: unknown;
};

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody<SignInPayload>(request);
    const email = asTrimmedString(body.email);
    const password = asTrimmedString(body.password);

    if (!email || !password) {
      return NextResponse.json({ message: "Email e senha são obrigatórios" }, { status: 400 });
    }

    const user = await storage.getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ message: "Email ou senha inválidos" }, { status: 401 });
    }

    const response = NextResponse.json({
      sessionId: user.id,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        points: user.totalPoints || 0,
        level: Math.floor((user.totalPoints || 0) / 100) + 1,
        description: user.description,
        avatar: user.avatar,
        github: user.github,
        linkedin: user.linkedin,
      },
    });

    setSessionCookie(response, user.id);
    return response;
  } catch {
    return internalError();
  }
}
