import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { tokenStore, userStore, type StoredUser } from "./api";

type AuthCtx = {
  user: StoredUser | null;
  token: string | null;
  isAuthed: boolean;
  signIn: (token: string, user?: StoredUser | null) => void;
  signOut: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

function decodeJwt(token: string): any | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    const t = tokenStore.get();
    const u = userStore.get();
    if (t) setToken(t);
    if (u) setUser(u);
    else if (t) {
      const claims = decodeJwt(t);
      if (claims) {
        const fallback: StoredUser = {
          id: claims.id || claims._id || claims.userId,
          email: claims.email,
          role: claims.role,
          name: claims.name,
        };
        setUser(fallback);
        userStore.set(fallback);
      }
    }
  }, []);

  const signIn = useCallback((newToken: string, newUser?: StoredUser | null) => {
    tokenStore.set(newToken);
    setToken(newToken);
    let u = newUser ?? null;
    if (!u) {
      const claims = decodeJwt(newToken);
      if (claims) {
        u = {
          id: claims.id || claims._id || claims.userId,
          email: claims.email,
          role: claims.role,
          name: claims.name,
        };
      }
    }
    if (u) {
      setUser(u);
      userStore.set(u);
    }
  }, []);

  const signOut = useCallback(() => {
    tokenStore.clear();
    setToken(null);
    setUser(null);
  }, []);

  return (
    <Ctx.Provider value={{ user, token, isAuthed: !!token, signIn, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
