import { NextResponse } from "next/server";
import { storage } from "@/lib/server/deps";
import { getCurrentUserId } from "@/lib/server/auth";
import { internalError } from "@/lib/server/http";
import { toPublicUser } from "@/lib/server/user-contract";

export const runtime = "nodejs";

export async function GET(request: Request) {
    try {
        const userId = getCurrentUserId(request);
        if (!userId) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const user = await storage.getUser(userId);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 401 });
        }

        return NextResponse.json({
            user: toPublicUser(user),
        });
    } catch {
        return internalError();
    }
}
