import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { api, ApiError } from "../../lib/api";
import { AuthContext } from "./useAuth";
import type { AuthState, SessionUser } from "./useAuth";

/** Lit la session auprès de l'API. Ne lève jamais : sans session valide, l'état est « anonyme ». */
async function loadSession(): Promise<AuthState> {
  try {
    return { status: "signed-in", user: await api<SessionUser>("/auth/me") };
  } catch (err) {
    if (!(err instanceof ApiError) || err.status !== 401) console.error(err);
    return { status: "anonymous" };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    let current = true;
    void loadSession().then((state) => current && setAuth(state));
    return () => {
      current = false;
    };
  }, []);

  /** Relit la session (après une inscription, qui en ouvre une côté API). */
  const refresh = useCallback(async () => setAuth(await loadSession()), []);

  const login = useCallback(async (email: string, password: string) => {
    const user = await api<SessionUser>("/auth/login", { method: "POST", body: { email, password } });
    setAuth({ status: "signed-in", user });
  }, []);

  const logout = useCallback(async () => {
    await api("/auth/logout", { method: "POST" }).catch(() => undefined);
    setAuth({ status: "anonymous" });
  }, []);

  const value = useMemo(() => ({ auth, login, logout, refresh }), [auth, login, logout, refresh]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
