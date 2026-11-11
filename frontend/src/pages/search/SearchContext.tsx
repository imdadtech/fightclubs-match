import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { criteriaForFighter, listOwnFighters } from "../../lib/fighters";
import type { Fighter, SearchCriteria } from "../../lib/fighters";

type Load = { status: "loading" } | { status: "error" } | { status: "ready" };

interface SearchState {
  load: Load;
  /** Combattants du club connecté. */
  fighters: Fighter[];
  /** `null` tant qu'aucun combattant n'est chargé. */
  criteria: SearchCriteria | null;
  setCriteria: (criteria: SearchCriteria) => void;
}

const SearchContext = createContext<SearchState | null>(null);

/** Combattants du club et critères de recherche, partagés entre critères, résultats et fiche. */
export function SearchProvider({ children }: { children: ReactNode }) {
  const [load, setLoad] = useState<Load>({ status: "loading" });
  const [fighters, setFighters] = useState<Fighter[]>([]);
  const [criteria, setCriteria] = useState<SearchCriteria | null>(null);

  useEffect(() => {
    listOwnFighters().then(
      (list) => {
        setFighters(list);
        setCriteria((c) => c ?? (list[0] ? criteriaForFighter(list[0]) : null));
        setLoad({ status: "ready" });
      },
      () => setLoad({ status: "error" }),
    );
  }, []);

  const value = useMemo(() => ({ load, fighters, criteria, setCriteria }), [load, fighters, criteria]);
  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearch(): SearchState {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch doit être utilisé dans <SearchProvider>");
  return ctx;
}
