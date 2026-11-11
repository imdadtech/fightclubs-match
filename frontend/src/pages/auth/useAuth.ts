import { createContext, useContext } from "react";

export interface SessionUser {
  id: string;
  email: string;
  clubId: string | null;
  club: { id: string; name: string } | null;
}

export type AuthState =
  | { status: "loading" }
  | { status: "anonymous" }
  | { status: "signed-in"; user: SessionUser };

export interface AuthContextValue {
  auth: AuthState;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Relit la session (après une inscription, qui ouvre une session côté API). */
  refresh: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans <AuthProvider>");
  return ctx;
}
