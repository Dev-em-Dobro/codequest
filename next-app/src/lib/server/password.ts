import bcrypt from "bcrypt";
import { createHash, randomBytes } from "node:crypto";

const BCRYPT_ROUNDS = 12;
const RESET_TOKEN_BYTES = 32;
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(password, passwordHash);
}

export function generatePasswordResetToken(): string {
    return randomBytes(RESET_TOKEN_BYTES).toString("hex");
}

export function hashPasswordResetToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
}

export function getPasswordResetExpiry(): string {
    return new Date(Date.now() + RESET_TOKEN_TTL_MS).toISOString();
}

export function isPasswordResetExpired(expiresAt: string | undefined): boolean {
    if (!expiresAt) {
        return true;
    }

    const expiresMs = Date.parse(expiresAt);
    return !Number.isFinite(expiresMs) || expiresMs <= Date.now();
}
