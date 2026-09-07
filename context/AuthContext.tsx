"use client";

/**
 * context/AuthContext.tsx
 * -----------------------
 * Provides the current Firebase user to the entire client-side tree and
 * subscribes to auth-state changes via `onAuthStateChanged`.
 *
 * Usage: wrap the app in <AuthProvider> (see app/layout.tsx) and consume
 * with the useAuth() hook, e.g.  const { user, loading } = useAuth();
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextValue {
  /** The signed-in Firebase user, or null when logged out. */
  user: User | null;
  /** True while Firebase is restoring the session on first load. */
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fires immediately with the restored session (or null), then again
    // on every sign-in / sign-out. Unsubscribes on unmount.
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Convenience hook for accessing the auth state anywhere in the tree. */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an <AuthProvider>");
  }
  return context;
}
