import { useEffect, useState } from "react";

export type AsyncState<T> =
  | { status: "loading" }
  | { status: "error"; error: unknown }
  | { status: "done"; data: T };

/** Charge `load()` à chaque changement de `key` (ignore les réponses périmées). `delay` : anti-rebond en ms. */
export function useAsync<T>(load: () => Promise<T>, key: string, delay = 0): AsyncState<T> & { reload: () => void } {
  const [state, setState] = useState<AsyncState<T>>({ status: "loading" });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let current = true;
    setState((s) => (s.status === "done" ? s : { status: "loading" }));
    const timer = setTimeout(() => {
      load().then(
        (data) => current && setState({ status: "done", data }),
        (error) => current && setState({ status: "error", error }),
      );
    }, delay);
    return () => {
      current = false;
      clearTimeout(timer);
    };
    // `key` résume les entrées de `load`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, nonce]);

  return { ...state, reload: () => setNonce((n) => n + 1) };
}
