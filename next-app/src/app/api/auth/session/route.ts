import { NextResponse } from "next/server";
import { storage } from "@/lib/server/deps";
import { getCurrentUserId } from "@/lib/server/auth";
import { internalError } from "@/lib/server/http";

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
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                points: user.totalPoints || 0,
                level: Math.floor((user.totalPoints || 0) / 100) + 1,
            },
        });
    } catch {
        return internalError();
    }
}
