import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import ClubOnboarding from "./pages/onboarding/club/ClubOnboarding";
import ProfilePicker from "./pages/onboarding/ProfilePicker";
import { AuthProvider } from "./pages/auth/AuthContext";
import Login from "./pages/auth/Login";
import RequireClub from "./pages/auth/RequireClub";
import ComingSoon from "./pages/search/ComingSoon";
import Contact from "./pages/search/Contact";
import Criteria from "./pages/search/Criteria";
import Notifications from "./pages/search/Notifications";
import OpponentProfile from "./pages/search/OpponentProfile";
import Results from "./pages/search/Results";
import { SearchProvider } from "./pages/search/SearchContext";

function ClubArea() {
  return (
    <SearchProvider>
      <Outlet />
    </SearchProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/onboarding" replace />} />
        <Route path="/onboarding" element={<ProfilePicker />} />
        <Route path="/onboarding/club" element={<ClubOnboarding />} />
        <Route path="/connexion" element={<Login />} />
        <Route element={<RequireClub />}>
          <Route element={<ClubArea />}>
            <Route path="/adversaires" element={<Criteria />} />
            <Route path="/adversaires/resultats" element={<Results />} />
            <Route path="/adversaires/:id" element={<OpponentProfile />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/notifications/:id" element={<Contact />} />
            <Route path="/annonces" element={<ComingSoon title="Annonces" />} />
            <Route path="/profil" element={<ComingSoon title="Profil" />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
