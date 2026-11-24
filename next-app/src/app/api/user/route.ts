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

        const user = await storage.getUser(userId);
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch {
        return internalError();
    }
}
