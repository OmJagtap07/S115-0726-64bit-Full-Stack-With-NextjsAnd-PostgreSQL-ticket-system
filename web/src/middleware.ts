import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Define the public routes that do not require authentication
const publicRoutes = ['/login', '/register', '/api/auth/login', '/api/auth/register', '/api/auth/refresh-token'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check if route is public
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get('accessToken')?.value;

  if (!accessToken) {
    // If it's an API route, return 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }
    // Otherwise redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('FATAL: JWT_SECRET environment variable is not defined.');
    }
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(accessToken, secret);

    // Basic RBAC checking based on URL paths
    const role = payload.role as string;
    
    if (pathname.startsWith('/admin') && role !== 'ADMIN') {
      return pathname.startsWith('/api/') 
        ? NextResponse.json({ status: 'error', message: 'Forbidden' }, { status: 403 })
        : NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (pathname.startsWith('/agent') && role !== 'AGENT' && role !== 'ADMIN') {
      return pathname.startsWith('/api/') 
        ? NextResponse.json({ status: 'error', message: 'Forbidden' }, { status: 403 })
        : NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Attach decoded user info to headers so Route Handlers can access it
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId as string);
    requestHeaders.set('x-user-role', payload.role as string);
    requestHeaders.set('Authorization', `Bearer ${accessToken}`);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    // Token is invalid or expired
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }
    
    // Clear the bad token and redirect
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('accessToken');
    return response;
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
