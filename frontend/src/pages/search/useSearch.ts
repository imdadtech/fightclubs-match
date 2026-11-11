import { createContext, useContext } from "react";
import type { Fighter, SearchCriteria } from "../../lib/fighters";

export type Load = { status: "loading" } | { status: "error" } | { status: "ready" };

export interface SearchState {
  load: Load;
  /** Combattants du club connecté. */
  fighters: Fighter[];
  /** `null` tant qu'aucun combattant n'est chargé. */
  criteria: SearchCriteria | null;
  setCriteria: (criteria: SearchCriteria) => void;
}

export const SearchContext = createContext<SearchState | null>(null);

export function useSearch(): SearchState {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch doit être utilisé dans <SearchProvider>");
  return ctx;
}
