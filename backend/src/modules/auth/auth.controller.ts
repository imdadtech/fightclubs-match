import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import { z } from "zod";
import { clubSignupSchema, loginSchema } from "./auth.schemas.js";
import { endSession, startSession } from "./session.js";
import { prisma } from "../../db/prisma.js";
import { Prisma } from "../../generated/prisma/client.js";

const BCRYPT_ROUNDS = 12;

// Hash factice pour que la durée de réponse ne révèle pas si l'e-mail existe.
const DUMMY_HASH = bcrypt.hashSync("dummy-password", BCRYPT_ROUNDS);

export async function signupClub(req: Request, res: Response) {
  const parsed = clubSignupSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "validation", issues: z.flattenError(parsed.error) });
    return;
  }
  const { club, manager } = parsed.data;
  const now = new Date();

  try {
    const created = await prisma.club.create({
      data: {
        ...club,
        contactFirstName: manager.firstName,
        contactLastName: manager.lastName,
        contactPhone: manager.phone,
        phoneHasWhatsapp: manager.phoneHasWhatsapp,
        shareWhatsapp: manager.contacts.whatsapp,
        shareEmail: manager.contacts.email,
        sharePhone: manager.contacts.phone,
        sharingConsentAt: now,
        users: {
          create: {
            email: manager.email,
            passwordHash: await bcrypt.hash(manager.password, BCRYPT_ROUNDS),
            termsAcceptedAt: now,
          },
        },
      },
      include: { users: { omit: { passwordHash: true } } },
    });
    await startSession(res, created.users[0].id);
    res.status(201).json(created);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      res.status(409).json({ error: "email_taken" });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "internal" });
  }
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "validation", issues: z.flattenError(parsed.error) });
    return;
  }
  const { email, password } = parsed.data;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !ok) {
      res.status(401).json({ error: "invalid_credentials" });
      return;
    }
    await startSession(res, user.id);
    const { passwordHash: _omit, ...safe } = user;
    res.json(safe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal" });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    await endSession(req, res);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal" });
  }
}

export function me(req: Request, res: Response) {
  res.json(req.user);
}
