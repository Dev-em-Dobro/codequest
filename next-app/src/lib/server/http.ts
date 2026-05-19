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
  captureServerError(error ?? new Error("Internal server error"), context);
  return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
}
