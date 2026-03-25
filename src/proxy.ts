import { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const proxy = (request: NextRequest) => {
    const accessToken = request.cookies.get('access_token')?.value;
    const refreshToken = request.cookies.get('refresh_token')?.value;
    const pathname = request.nextUrl.pathname;
    const isGoogleAuthCallbackRoute = pathname === '/auth/google' || pathname.startsWith('/auth/google/');
    
    const isAuthenticated = !!(accessToken || refreshToken);

    if (pathname.startsWith('/main')) {
        if (!isAuthenticated) {
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }
    }

    if (pathname.startsWith('/auth')) {
        if (isAuthenticated && !isGoogleAuthCallbackRoute) {
            return NextResponse.redirect(new URL('/main/home', request.url));
        }
    }

    return NextResponse.next();
}