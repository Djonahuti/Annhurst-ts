'use client';
import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  role: 'driver' | 'admin' | 'coordinator' | null;
  adminRole: 'viewer' | 'editor' | 'admin' | null;
  signIn: (email: string, password: string) => Promise<{ error?: Error; role?: 'driver' | 'admin' | 'coordinator' | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const loading = status === 'loading';
  const user = session?.user ?? null;
  const role = session?.user?.role ?? null;
  const adminRole = session?.user?.adminRole ?? null;

  const signIn = async (email: string, password: string) => {
    const res = await nextAuthSignIn('credentials', { redirect: false, email, password });
    if (res?.error) {
      // Handle errors like banned accounts
      throw new Error(res.error); // e.g., "Account banned" or "Invalid credentials"
    }
    // Redirect based on role after successful sign-in
    const { data: newSession } = await fetch('/api/auth/session').then(r => r.json());
    return { role: newSession?.user?.role ?? null };
  };

  const signOut = async () => {
    await nextAuthSignOut({ redirect: false });
    router.push('/login');
  };

  // Redirect to appropriate dashboard on session change
  useEffect(() => {
    if (!loading && user) {
      if (role === 'admin') router.push('/admin');
      else if (role === 'coordinator') router.push('/user');
      else if (role === 'driver') router.push('/profile');
      else router.push('/login?error=unknown_role');
    }
  }, [user, role, loading, router]);

  return (
    <AuthContext.Provider value={{ user, loading, role, adminRole, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within AuthProvider');
  return context;
}