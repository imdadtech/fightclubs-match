import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import AppLogo from "../../components/atoms/AppLogo";
import Button from "../../components/atoms/Buttons";
import TextField from "../../components/molecules/form/TextField";
import { ApiError } from "../../lib/api";
import { useAuth } from "./AuthContext";

function Login() {
  const { auth, login } = useAuth();
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? "/adversaires";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  if (auth.status === "signed-in") return <Navigate to={from} replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(undefined);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 401
          ? "E-mail ou mot de passe incorrect."
          : "Connexion impossible pour le moment. Réessaie dans un instant.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-100 flex-col justify-center gap-6 px-4 py-8">
      <AppLogo />
      <div>
        <h1 className="m-0 font-display text-[30px] leading-8 font-black tracking-[-0.01em]">Connexion</h1>
        <p className="mt-1.5 mb-0 text-[14px] leading-5 text-ink-muted">Retrouve les combattants de ton club.</p>
      </div>
      <form onSubmit={submit} className="flex flex-col gap-3.5">
        <TextField label="E-mail" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <TextField
          label="Mot de passe"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error}
          required
        />
        <Button type="submit" size="lg" disabled={busy}>
          Se connecter
        </Button>
      </form>
      <p className="m-0 text-[14px] text-ink-muted">
        Pas encore de compte ? <Link to="/onboarding/club">Inscris ton club</Link>
      </p>
    </main>
  );
}

export default Login;
