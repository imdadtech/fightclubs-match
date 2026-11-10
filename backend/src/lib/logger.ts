import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import pino from "pino";

/**
 * Couche d'abstraction du logging. Le reste du code ne dépend que de `logger`
 * (interface `Logger`), jamais de pino : changer d'outil = changer ce fichier.
 *
 * - dev  : écrit dans un fichier local (`LOG_FILE`, défaut `logs/app.log`)
 *          et recopie sur la console pour garder le retour immédiat.
 * - prod : JSON sur stdout au format Cloud Logging (Cloud Run). Cloud Run
 *          collecte stdout automatiquement ; `severity` et `message` sont
 *          reconnus par GCP, et les erreurs avec stack remontent dans
 *          Error Reporting.
 */
export interface Logger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, error?: unknown, context?: Record<string, unknown>): void;
  child(bindings: Record<string, unknown>): Logger;
}

const isProd = process.env.NODE_ENV === "production";

function createDestinations(): pino.DestinationStream | undefined {
  if (isProd) return undefined; // stdout
  const file = process.env.LOG_FILE ?? "logs/app.log";
  mkdirSync(dirname(file), { recursive: true });
  return pino.multistream([
    { stream: pino.destination({ dest: file, sync: false }) },
    { stream: process.stdout },
  ]);
}

// Format attendu par Cloud Logging : `severity` + `message`, pas `level` + `msg`.
const gcpFormat: pino.LoggerOptions = {
  messageKey: "message",
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ severity: label === "warn" ? "WARNING" : label.toUpperCase() }),
    bindings: () => ({}), // pas de pid/hostname
  },
};

const base = pino(
  {
    ...(isProd ? gcpFormat : {}),
    level: process.env.LOG_LEVEL ?? (isProd ? "info" : "debug"),
    // Ne jamais journaliser de secrets ni de données personnelles.
    redact: {
      paths: ["*.password", "*.passwordHash", "*.email", "*.phone", "req.headers.cookie", "req.headers.authorization"],
      censor: "[redacted]",
    },
  },
  createDestinations(),
);

function wrap(p: pino.Logger): Logger {
  return {
    debug: (message, context) => p.debug(context ?? {}, message),
    info: (message, context) => p.info(context ?? {}, message),
    warn: (message, context) => p.warn(context ?? {}, message),
    error: (message, error, context) => {
      // Cloud Error Reporting détecte les erreurs via la stack dans `message`.
      const stack = isProd && error instanceof Error ? error.stack : undefined;
      p.error({ ...context, err: error }, stack ? `${message}\n${stack}` : message);
    },
    child: (bindings) => wrap(p.child(bindings)),
  };
}

export const logger: Logger = wrap(base);
