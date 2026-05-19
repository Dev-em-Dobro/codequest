import type { AppUser } from "./types";

export type PublicUser = {
    id: string;
    name: string;
    email: string;
    points: number;
    level: number;
    description?: string;
    avatar?: string;
    github?: string;
    linkedin?: string;
};

export function resolveUserPoints(totalPoints: number | null | undefined): number {
    const points = Number(totalPoints ?? 0);
    return Number.isFinite(points) ? points : 0;
}

export function resolveUserLevel(points: number): number {
    return Math.floor(points / 100) + 1;
}

export function toPublicUser(user: AppUser): PublicUser {
    const points = resolveUserPoints(user.totalPoints);

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        points,
        level: resolveUserLevel(points),
        description: user.description,
        avatar: user.avatar,
        github: user.github,
        linkedin: user.linkedin,
    };
}
