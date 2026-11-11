import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

/** Réserve les écrans du club connecté : sans session, renvoie vers la connexion. */
function RequireClub() {
  const { auth } = useAuth();
  const location = useLocation();
  if (auth.status === "loading") return null;
  if (auth.status === "anonymous") return <Navigate to="/connexion" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

export default RequireClub;
