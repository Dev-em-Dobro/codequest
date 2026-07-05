import { NextResponse } from "next/server";
import { storage } from "@/lib/server/deps";
import { parseJsonBody, internalError } from "@/lib/server/http";
import { setSessionCookie } from "@/lib/server/auth";
import { enforceRateLimit } from "@/lib/server/rate-limit";
import { toPublicUser } from "@/lib/server/user-contract";
import { verifyPassword } from "@/lib/server/password";

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
    const limited = enforceRateLimit(request, {
      id: "auth-sign-in",
      windowMs: 15 * 60 * 1000,
      max: 5,
      message: "Muitas tentativas de autenticacao. Tente novamente mais tarde.",
    });

    if (limited) {
      return limited;
    }

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

    const passwordHash = await storage.getUserPasswordHash(user.id);
    if (!passwordHash) {
      return NextResponse.json(
        {
          message:
            "Sua conta ainda não tem senha definida. Use 'Esqueci minha senha' para criar uma e acessar o CodeQuest.",
          code: "NEEDS_PASSWORD_RESET",
        },
        { status: 403 },
      );
    }

    if (!(await verifyPassword(password, passwordHash))) {
      return NextResponse.json({ message: "Email ou senha inválidos" }, { status: 401 });
    }

    const publicUser = toPublicUser(user);

    const response = NextResponse.json({
      sessionId: user.id,
      user: publicUser,
    });

    setSessionCookie(response, user.id);
    return response;
  } catch (error) {
    return internalError(error, { route: "auth-sign-in" });
  }
}
