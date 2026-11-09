import { Navigate, Route, Routes } from "react-router-dom";
import ClubOnboarding from "./pages/onboarding/club/ClubOnboarding";
import ProfilePicker from "./pages/onboarding/ProfilePicker";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/onboarding" replace />} />
      <Route path="/onboarding" element={<ProfilePicker />} />
      <Route path="/onboarding/club" element={<ClubOnboarding />} />
    </Routes>
  );
}

export default App;
