import { NextResponse } from "next/server";
import { unauthorized } from "@/lib/server/auth";
import { getCurrentUserId } from "@/lib/server/current-user";
import { storage } from "@/lib/server/deps";
import { internalError } from "@/lib/server/http";

export const runtime = "nodejs";

export async function GET(request: Request) {
    try {
        const userId = await getCurrentUserId(request);
        if (!userId) {
            return unauthorized();
        }

        const progress = await storage.getUserProgress(userId);
        return NextResponse.json(progress);
    } catch {
        return internalError();
    }
}
