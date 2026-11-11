import { useNavigate } from "react-router-dom";
import { createFighter } from "../../lib/fighters";
import { useSearch } from "../search/useSearch";
import FighterFormFlow from "./FighterFormFlow";

/** Le club saisit lui-même la fiche d'un combattant, puis revient à la liste. */
function AddFighter() {
  const { refresh } = useSearch();
  const navigate = useNavigate();

  return (
    <FighterFormFlow
      variant="club"
      onSubmit={async (input) => {
        await createFighter(input);
        await refresh();
        navigate("/profil");
      }}
    />
  );
}

export default AddFighter;
