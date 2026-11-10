// Prépare la base dédiée aux tests E2E : la crée si besoin, puis applique les migrations.
// Elle est distincte de la base de dev pour ne jamais polluer tes données.
import "dotenv/config";
import { execSync } from "node:child_process";
import pg from "pg";

const E2E_DB = "fightclubs_e2e";
const adminUrl = process.env.E2E_ADMIN_DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/postgres";
const e2eUrl = process.env.E2E_DATABASE_URL ?? adminUrl.replace(/\/[^/]*$/, `/${E2E_DB}`);

const admin = new pg.Client({ connectionString: adminUrl });
await admin.connect();
const { rowCount } = await admin.query("SELECT 1 FROM pg_database WHERE datname = $1", [E2E_DB]);
if (!rowCount) await admin.query(`CREATE DATABASE ${E2E_DB}`);
await admin.end();

execSync("npx prisma migrate deploy", { stdio: "inherit", env: { ...process.env, DATABASE_URL: e2eUrl } });
