import { NextResponse } from "next/server";
import { userStorageAdapter } from "@/lib/server/deps";
import { internalError } from "@/lib/server/http";

export const runtime = "nodejs";

export async function GET() {
    try {
        const allUsers = await userStorageAdapter.getAllUsers();
        const rankedUsers = allUsers
            .filter((user) => Boolean(user?.id))
            .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
            .map((user, index) => ({
                id: user.id,
                name: user.name || "Usuário Anônimo",
                avatar: user.avatar,
                totalPoints: user.totalPoints || 0,
                completedExercises: user.completedExercises || 0,
                github: user.github,
                linkedin: user.linkedin,
                rank: index + 1,
            }));

        return NextResponse.json(rankedUsers);
    } catch {
        return internalError();
    }
}
