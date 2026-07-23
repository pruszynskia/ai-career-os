import { auth } from '@/shared/auth/config';

export default auth((req) => {
  const isSignedIn = Boolean(req.auth);
  const isSignInPage = req.nextUrl.pathname === '/sign-in';

  if (!isSignedIn && !isSignInPage) {
    return Response.redirect(new URL('/sign-in', req.nextUrl.origin));
  }
});

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};
