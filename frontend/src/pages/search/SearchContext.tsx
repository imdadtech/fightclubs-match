import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { criteriaForFighter, listOwnFighters } from "../../lib/fighters";
import type { Fighter, SearchCriteria } from "../../lib/fighters";
import { SearchContext } from "./useSearch";
import type { Load } from "./useSearch";

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
