import { NextResponse } from "next/server";
import { getCurrentUserId, unauthorized } from "@/lib/server/auth";
import { storage } from "@/lib/server/deps";
import { internalError } from "@/lib/server/http";

export const runtime = "nodejs";

export async function GET(request: Request) {
    try {
        const userId = getCurrentUserId(request);
        if (!userId) {
            return unauthorized();
        }

        const progress = await storage.getUserProgress(userId);
        return NextResponse.json(progress);
    } catch {
        return internalError();
    }
}
