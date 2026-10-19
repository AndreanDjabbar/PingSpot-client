import { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const proxy = (request: NextRequest) => {
    const accessToken = request.cookies.get('access_token')?.value;
    const refreshToken = request.cookies.get('refresh_token')?.value;

    const authRoutes = [
        '/login',
        '/register',
        '/forgot-password',
        '/forgot-password/verification',
        '/verification',
    ]

    const mainRoutes = [
        '/home',
        '/explore',
        '/notifications',
        '/profile',
        '/settings',
        '/reports'
    ]

    const pathname = request.nextUrl.pathname;

    const isGoogleAuthCallbackRoute = pathname === '/google' || pathname.startsWith('/google/');
    
    const isAuthenticated = !!(accessToken || refreshToken);

    if (mainRoutes.some(route => pathname.startsWith(route))) {
        if (!isAuthenticated) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    if (authRoutes.some(route => pathname.startsWith(route))) {
        if (isAuthenticated && !isGoogleAuthCallbackRoute) {
            return NextResponse.redirect(new URL('/home', request.url));
        }
    }

    return NextResponse.next();
}