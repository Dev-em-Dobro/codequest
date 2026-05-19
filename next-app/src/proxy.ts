import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/server/auth";

function isProtectedRoute(pathname: string): boolean {
    return pathname.startsWith("/auth/profile") || pathname.startsWith("/admin");
}

export function proxy(request: NextRequest) {
    const { pathname, search } = request.nextUrl;
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
    matcher: ["/auth/profile", "/admin/:path*"],
};
