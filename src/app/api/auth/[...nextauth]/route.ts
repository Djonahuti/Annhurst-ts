import NextAuth, { NextAuthOptions, Session, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { JWT } from 'next-auth/jwt';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Check admins
        const admin = await prisma.admins.findUnique({ where: { email: credentials.email } });
        if (admin) {
          if (admin.banned) throw new Error('Account banned');
          if (await bcrypt.compare(credentials.password, admin.password!)) {
            return {
              id: admin.id.toString(),
              email: admin.email,
              role: 'admin' as const,
              adminRole: admin.role as 'viewer' | 'editor' | 'admin' | null,
            };
          }
        }

        // Check coordinators
        const coord = await prisma.coordinators.findFirst({ where: { email: credentials.email } });
        if (coord) {
          if (coord.banned) throw new Error('Account banned');
          if (await bcrypt.compare(credentials.password, coord.password!)) {
            return {
              id: coord.id.toString(),
              email: coord.email,
              role: 'coordinator' as const,
              adminRole: null,
            };
          }
        }

        // Check drivers
        const driver = await prisma.driver.findFirst({ where: { email: credentials.email } });
        if (driver) {
          if (driver.banned) throw new Error('Account banned');
          if (await bcrypt.compare(credentials.password, driver.password!)) {
            return {
              id: driver.id.toString(),
              email: driver.email,
              role: 'driver' as const,
              adminRole: null,
            };
          }
        }

        throw new Error('Invalid credentials');
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.role = user.role;
        token.adminRole = user.adminRole;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.adminRole = token.adminRole;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };