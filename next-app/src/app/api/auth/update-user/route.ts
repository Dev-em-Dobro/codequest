import { NextResponse } from "next/server";
import { getCurrentUserId, unauthorized } from "@/lib/server/auth";
import { userStorageAdapter } from "@/lib/server/deps";
import { parseJsonBody, internalError } from "@/lib/server/http";
import type { UpdateUserInput } from "@/lib/server/types";

export const runtime = "nodejs";

type UpdateUserBody = {
    name?: unknown;
    points?: unknown;
    description?: unknown;
    avatar?: unknown;
    github?: unknown;
    linkedin?: unknown;
};

function asOptionalString(value: unknown): string | undefined {
    return typeof value === "string" ? value : undefined;
}

function setOptionalStringField<K extends keyof UpdateUserInput>(
    target: UpdateUserInput,
    key: K,
    value: unknown,
) {
    const parsed = asOptionalString(value);
    if (parsed !== undefined) {
        target[key] = parsed as UpdateUserInput[K];
    }
}

function buildUpdateUserInput(body: UpdateUserBody): UpdateUserInput {
    const updateData: UpdateUserInput = {};

    setOptionalStringField(updateData, "name", body.name);
    setOptionalStringField(updateData, "description", body.description);
    setOptionalStringField(updateData, "avatar", body.avatar);
    setOptionalStringField(updateData, "github", body.github);
    setOptionalStringField(updateData, "linkedin", body.linkedin);

    if (body.points !== undefined) {
        const points = Number(body.points);
        if (Number.isFinite(points)) {
            updateData.totalPoints = points;
        }
    }

    return updateData;
}

export async function POST(request: Request) {
    try {
        const userId = getCurrentUserId(request);
        if (!userId) {
            return unauthorized();
        }

        const body = await parseJsonBody<UpdateUserBody>(request);
        const updateData = buildUpdateUserInput(body);

        const user = await userStorageAdapter.updateUser(userId, updateData);

        return NextResponse.json({
            user: {
                id: user?.id,
                name: user?.name,
                email: user?.email,
                description: user?.description,
                avatar: user?.avatar,
                github: user?.github,
                linkedin: user?.linkedin,
                points: user?.totalPoints || 0,
                level: Math.floor((user?.totalPoints || 0) / 100) + 1,
            },
            success: true,
        });
    } catch {
        return internalError();
    }
}
