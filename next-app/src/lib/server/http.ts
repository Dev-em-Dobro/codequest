import { NextResponse } from "next/server";

export async function parseJsonBody<T = Record<string, unknown>>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    return {} as T;
  }
}

export function internalError() {
  return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
}
