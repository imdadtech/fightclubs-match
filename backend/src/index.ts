import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { prisma } from "./db/prisma.js";
import { authRouter } from "./modules/auth/auth.routes.js";

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL ?? "http://localhost:5173", credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use("/auth", authRouter);

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "up" });
  } catch {
    res.status(503).json({ status: "error", db: "down" });
  }
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => console.log(`API sur http://localhost:${port}`));
