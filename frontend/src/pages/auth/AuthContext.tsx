import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { api, ApiError } from "../../lib/api";
import { AuthContext } from "./useAuth";
import type { AuthState, SessionUser } from "./useAuth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    api<SessionUser>("/auth/me")
      .then((user) => setAuth({ status: "signed-in", user }))
      .catch((err) => {
        if (!(err instanceof ApiError) || err.status !== 401) console.error(err);
        setAuth({ status: "anonymous" });
      });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const user = await api<SessionUser>("/auth/login", { method: "POST", body: { email, password } });
    setAuth({ status: "signed-in", user });
  }, []);

  const logout = useCallback(async () => {
    await api("/auth/logout", { method: "POST" }).catch(() => undefined);
    setAuth({ status: "anonymous" });
  }, []);

  const value = useMemo(() => ({ auth, login, logout }), [auth, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
