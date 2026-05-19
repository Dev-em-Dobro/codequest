import { NextResponse } from "next/server";
import { captureServerError } from "./sentry";

export async function parseJsonBody<T = Record<string, unknown>>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    return {} as T;
  }
}

export function internalError(error?: unknown, context?: Record<string, unknown>) {
  const resolvedError = error ?? new Error("Internal server error");
  captureServerError(resolvedError, context);

  if (process.env.NODE_ENV !== "production" && resolvedError instanceof Error) {
    return NextResponse.json({ message: resolvedError.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
}
