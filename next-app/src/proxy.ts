import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/server/auth";

const LEGACY_HOSTNAME = "code-quest-devquest.replit.app";
const CANONICAL_ORIGIN = "https://codequest.devemdobro.com";

function isProtectedRoute(pathname: string): boolean {
    return pathname.startsWith("/auth/profile") || pathname.startsWith("/admin");
}

export function proxy(request: NextRequest) {
    const { pathname, search, hostname } = request.nextUrl;

    if (hostname === LEGACY_HOSTNAME) {
        const redirectUrl = new URL(`${pathname}${search}`, CANONICAL_ORIGIN);
        return NextResponse.redirect(redirectUrl, 308);
    }

    if (!isProtectedRoute(pathname)) {
        return NextResponse.next();
    }

    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (sessionCookie) {
        return NextResponse.next();
    }

    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("redirect", `${pathname}${search}`);

    return NextResponse.redirect(signInUrl);
}

export const config = {
    matcher: ["/:path*"],
};
