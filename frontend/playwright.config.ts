import { defineConfig, devices } from "@playwright/test";

// Ports dédiés pour ne pas entrer en conflit avec `npm run dev` (5173 / 3000).
const FRONT_PORT = 5174;
const API_PORT = 3100;
const FRONT_URL = `http://localhost:${FRONT_PORT}`;
const API_URL = `http://localhost:${API_PORT}`;
const DB_URL = process.env.E2E_DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/fightclubs_e2e";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.e2e.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: FRONT_URL,
    trace: "retain-on-failure",
    // `SLOWMO=400` ralentit chaque action (ms) pour suivre le test à l'œil.
    launchOptions: { slowMo: Number(process.env.SLOWMO) || 0 },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      // Vraie API + vraie base PostgreSQL (le conteneur `npm run db:up` du backend doit tourner).
      command: "npm run e2e:setup && npx tsx src/index.ts",
      cwd: "../backend",
      url: `${API_URL}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: { PORT: String(API_PORT), DATABASE_URL: DB_URL, FRONTEND_URL: FRONT_URL, LOG_LEVEL: "warn", LOG_FILE: "logs/e2e.log" },
    },
    {
      command: `npx vite --port ${FRONT_PORT} --strictPort`,
      url: FRONT_URL,
      reuseExistingServer: !process.env.CI,
      env: { VITE_API_URL: API_URL },
    },
  ],
});
