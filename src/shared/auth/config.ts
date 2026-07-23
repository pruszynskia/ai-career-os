import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { SEED_OWNER_ID } from '@/shared/auth/owner';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'Owner',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        const ownerEmail = process.env.AUTH_OWNER_EMAIL;
        const ownerPassword = process.env.AUTH_OWNER_PASSWORD;

        if (
          typeof email !== 'string' ||
          typeof password !== 'string' ||
          !ownerEmail ||
          !ownerPassword
        ) {
          return null;
        }

        if (email !== ownerEmail || password !== ownerPassword) {
          return null;
        }

        return { id: SEED_OWNER_ID, email: ownerEmail };
      },
    }),
  ],
  pages: {
    signIn: '/sign-in',
  },
  session: {
    strategy: 'jwt',
  },
});
