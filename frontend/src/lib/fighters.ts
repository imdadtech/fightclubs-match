import { api } from "./api";

export type Discipline = "BOXE_ANGLAISE" | "MUAY_THAI" | "KICK_BOXING" | "K1" | "MMA";

export const DISCIPLINES: { value: Discipline; label: string }[] = [
  { value: "BOXE_ANGLAISE", label: "Boxe anglaise" },
  { value: "MUAY_THAI", label: "Muay-thaï" },
  { value: "KICK_BOXING", label: "Kick-boxing" },
  { value: "K1", label: "K-1" },
  { value: "MMA", label: "MMA" },
];
export const disciplineLabel = (d: Discipline) => DISCIPLINES.find((x) => x.value === d)?.label ?? d;

/** Catégories proposées (indicatives : la grille officielle sera définie avec les organisateurs). */
export const WEIGHT_CLASSES_KG = [57, 60, 63.5, 67, 71, 75, 81, 86, 91];

export const formatWeight = (kg: number) => `−${String(kg).replace(".", ",")} kg`;
export const formatWeights = (kgs: number[]) => kgs.map(formatWeight).join(" / ");

export interface ClubSummary {
  id: string;
  name: string;
  city: string;
  postalCode: string;
}

export interface Fighter {
  id: string;
  firstName: string;
  lastInitial: string;
  club: ClubSummary;
  discipline: Discipline;
  weightClassesKg: number[];
  age: number;
  heightCm: number | null;
  fights: number;
  wins: number;
  losses: number;
  /** « 2026-12 » */
  availableMonths: string[];
}

export const fighterName = (f: Pick<Fighter, "firstName" | "lastInitial">) => `${f.firstName} ${f.lastInitial}.`;
export const fighterInitials = (f: Pick<Fighter, "firstName" | "lastInitial">) => `${f.firstName[0]}${f.lastInitial}`;
export const formatHeight = (cm: number | null) => (cm === null ? "—" : `${(cm / 100).toFixed(2).replace(".", ",")} m`);
/** « Lyon (69) » */
export const placeOf = (club: ClubSummary) => `${club.city} (${club.postalCode.slice(0, 2)})`;

const MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
export const monthName = (key: string) => MONTHS[Number(key.slice(5, 7)) - 1];
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
/** « Décembre 2026 » */
export const monthLabel = (key: string) => capitalize(`${monthName(key)} ${key.slice(0, 4)}`);

/** Les 12 prochains mois, à partir du mois prochain. */
export function upcomingMonths(count = 12): string[] {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + 1 + i, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
}

export type Compatibility = "very" | "ok";
export const compatibilityLabel = (c: Compatibility) => (c === "very" ? "✓ Très compatible" : "Compatible");

export interface SearchCriteria {
  fighterId: string;
  discipline: Discipline;
  weights: number[];
  /** « 2026-12 » ; vide = pas de date. */
  month: string;
  /** Champs facultatifs : chaîne vide = pas de limite. */
  minFights: string;
  maxFights: string;
  minWins: string;
  maxLosses: string;
}

export interface OpponentResult {
  fighter: Fighter;
  commonWeightKg: number;
  compatibility: Compatibility;
}

export interface SearchResponse {
  fighter: Fighter;
  total: number;
  results: OpponentResult[];
}

export interface OpponentDetail {
  fighter: Fighter;
  opponent: Fighter;
  commonWeightKg: number;
  compatibility: Compatibility;
}

export const criteriaForFighter = (fighter: Fighter, month = ""): SearchCriteria => ({
  fighterId: fighter.id,
  discipline: fighter.discipline,
  weights: fighter.weightClassesKg,
  month,
  minFights: "",
  maxFights: "",
  minWins: "",
  maxLosses: "",
});

const toLimit = (value: string): number | undefined => {
  const n = Number.parseInt(value.trim(), 10);
  return Number.isNaN(n) ? undefined : n;
};

/** Un minimum supérieur au maximum est une erreur (champ facultatif vide = pas de limite). */
export function fightsRangeError(c: SearchCriteria): string | undefined {
  const min = toLimit(c.minFights);
  const max = toLimit(c.maxFights);
  return min !== undefined && max !== undefined && min > max
    ? "Le minimum doit être inférieur ou égal au maximum."
    : undefined;
}

export function searchQuery(c: SearchCriteria): string {
  const params = new URLSearchParams({ fighterId: c.fighterId, discipline: c.discipline, weights: c.weights.join(",") });
  if (c.month) params.set("month", c.month);
  for (const [key, value] of [["minFights", c.minFights], ["maxFights", c.maxFights], ["minWins", c.minWins], ["maxLosses", c.maxLosses]] as const) {
    if (value.trim()) params.set(key, value.trim());
  }
  return params.toString();
}

export const listOwnFighters = () => api<Fighter[]>("/fighters");
export const searchOpponents = (c: SearchCriteria) => api<SearchResponse>(`/opponents?${searchQuery(c)}`);
export const getOpponent = (id: string, fighterId: string) =>
  api<OpponentDetail>(`/opponents/${id}?fighterId=${encodeURIComponent(fighterId)}`);

export type ProposalStatus = "PENDING" | "ACCEPTED" | "DECLINED";

export interface Proposal {
  id: string;
  status: ProposalStatus;
  weightClassKg: number;
  desiredMonth: string | null;
  createdAt: string;
  respondedAt: string | null;
  direction: "received" | "sent";
  from: Fighter;
  to: Fighter;
}

export interface ContactInfo {
  proposal: Proposal;
  club: ClubSummary;
  contact: { whatsapp: string | null; email: string | null; phone: string | null };
  confirmation: { mine: boolean; theirs: boolean };
}

export const createProposal = (body: { fromFighterId: string; toFighterId: string; weightClassKg: number; desiredMonth?: string }) =>
  api<Proposal>("/proposals", { method: "POST", body });
export const listProposals = (box: "received" | "sent") => api<Proposal[]>(`/proposals?box=${box}`);
export const acceptProposal = (id: string) => api<Proposal>(`/proposals/${id}/accept`, { method: "POST" });
export const declineProposal = (id: string) => api<Proposal>(`/proposals/${id}/decline`, { method: "POST" });
export const getContact = (id: string) => api<ContactInfo>(`/proposals/${id}/contact`);
export const confirmProposal = (id: string) => api<ContactInfo>(`/proposals/${id}/confirm`, { method: "POST" });

/** Ton combattant et l'adversaire d'une proposition, selon qu'elle est reçue ou envoyée. */
export const sidesOf = (p: Proposal) =>
  p.direction === "received" ? { mine: p.to, other: p.from } : { mine: p.from, other: p.to };

export function relativeTime(iso: string, now = Date.now()): string {
  const minutes = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
  if (minutes < 60) return minutes < 2 ? "À l'instant" : `Il y a ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `Il y a ${hours} h`;
  const days = Math.round(hours / 24);
  return days === 1 ? "Hier" : `Il y a ${days} j`;
}
