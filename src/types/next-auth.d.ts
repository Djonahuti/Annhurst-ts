import { Session, User } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      role?: 'driver' | 'admin' | 'coordinator' | null;
      adminRole?: 'viewer' | 'editor' | 'admin' | null;
    };
  }

  interface User {
    id?: string;
    role?: 'driver' | 'admin' | 'coordinator' | null;
    adminRole?: 'viewer' | 'editor' | 'admin' | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: 'driver' | 'admin' | 'coordinator' | null;
    adminRole?: 'viewer' | 'editor' | 'admin' | null;
  }
}