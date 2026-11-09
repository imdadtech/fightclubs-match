import { createHash, randomBytes } from "node:crypto";
import type { CookieOptions, NextFunction, Request, Response } from "express";
import { prisma } from "../../db/prisma.js";

export const SESSION_COOKIE = "fc_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

const cookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

/** Crée la session en base et pose le cookie (le jeton brut n'existe que dans le cookie). */
export async function startSession(res: Response, userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await prisma.session.create({ data: { tokenHash: hashToken(token), userId, expiresAt } });
  res.cookie(SESSION_COOKIE, token, { ...cookieOptions, expires: expiresAt });
}

export async function endSession(req: Request, res: Response) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (typeof token === "string") {
    await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
  res.clearCookie(SESSION_COOKIE, cookieOptions);
}

/** Refuse la requête (401) sans session valide, sinon expose `req.user`. */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[SESSION_COOKIE];
    if (typeof token !== "string") {
      res.status(401).json({ error: "unauthenticated" });
      return;
    }
    const session = await prisma.session.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { user: { omit: { passwordHash: true } } },
    });
    if (!session || session.expiresAt < new Date()) {
      if (session) await prisma.session.delete({ where: { id: session.id } });
      res.clearCookie(SESSION_COOKIE, cookieOptions);
      res.status(401).json({ error: "unauthenticated" });
      return;
    }
    req.user = session.user;
    next();
  } catch (err) {
    next(err);
  }
}
