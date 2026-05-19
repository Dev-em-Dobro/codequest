import { NextResponse } from "next/server";
import { getCurrentUserId, unauthorized } from "@/lib/server/auth";
import { storage } from "@/lib/server/deps";
import { parseJsonBody, internalError } from "@/lib/server/http";
import type { UpdateCode } from "@/lib/server/storage-types";

export const runtime = "nodejs";

export async function POST(request: Request) {
    try {
        const userId = getCurrentUserId(request);
        if (!userId) {
            return unauthorized();
        }

        const body = await parseJsonBody<UpdateCode>(request);
        if (!body?.exerciseId || !body?.userCode) {
            return NextResponse.json({ message: "Invalid request data" }, { status: 400 });
        }

        const progress = await storage.updateCode(userId, body);
        return NextResponse.json(progress);
    } catch {
        return internalError();
    }
}
