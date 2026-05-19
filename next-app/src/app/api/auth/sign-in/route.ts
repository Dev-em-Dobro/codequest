import { NextResponse } from "next/server";
import { storage } from "@/lib/server/deps";
import { parseJsonBody, internalError } from "@/lib/server/http";
import { setSessionCookie } from "@/lib/server/auth";
import { toPublicUser } from "@/lib/server/user-contract";

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
