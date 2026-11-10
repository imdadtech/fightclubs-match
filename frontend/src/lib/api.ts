/** Adresse de l'API (voir `.env.example`). */
const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3000";

export class ApiError extends Error {
  status: number;
  /** Code d'erreur renvoyé par l'API (ex. « email_taken »), s'il y en a un. */
  code?: string;

  constructor(status: number, code?: string) {
    super(code ?? `HTTP ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

/** Appel JSON vers l'API. Les cookies de session sont toujours envoyés. */
export async function api<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: init.method ?? "GET",
    credentials: "include",
    headers: init.body === undefined ? undefined : { "Content-Type": "application/json" },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });

  const data: unknown = await response.json().catch(() => undefined);
  if (!response.ok) {
    const code = typeof data === "object" && data !== null && "error" in data ? String(data.error) : undefined;
    throw new ApiError(response.status, code);
  }
  return data as T;
}
