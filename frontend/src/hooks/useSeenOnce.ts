import { useState } from "react";

/** Mémorise dans le localStorage qu'un message a déjà été vu (storage indisponible : le message reste affiché). */
export function useSeenOnce(key: string): [seen: boolean, markSeen: () => void] {
  const [seen, setSeen] = useState(() => {
    try {
      return localStorage.getItem(key) === "1";
    } catch {
      return false;
    }
  });

  const markSeen = () => {
    setSeen(true);
    try {
      localStorage.setItem(key, "1");
    } catch {
      // Stockage indisponible (navigation privée…) : on ignore.
    }
  };

  return [seen, markSeen];
}
