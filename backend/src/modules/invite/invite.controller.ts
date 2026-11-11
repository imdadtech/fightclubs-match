import { createHash, randomBytes } from "node:crypto";
import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../../db/prisma.js";
import { toFighterCreateData } from "../fighter/fighter.dto.js";
import { inviteSubmissionSchema } from "./invite.schemas.js";

const INVITE_TTL_MS = 14 * 24 * 60 * 60 * 1000;
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

/** Retrouve l'invitation d'un lien : `invite_not_found` (404), `invite_used` ou `invite_expired` (410). */
async function findInvite(token: string) {
  const invite = await prisma.fighterInvite.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { club: { select: { name: true } } },
  });
  if (!invite) return { ok: false as const, error: "invite_not_found" as const, status: 404 };
  if (invite.usedAt) return { ok: false as const, error: "invite_used" as const, status: 410 };
  if (invite.expiresAt < new Date()) return { ok: false as const, error: "invite_expired" as const, status: 410 };
  return { ok: true as const, invite };
}

/** Le club connecté génère un lien à usage unique (valable 14 jours) pour un combattant. */
export async function createInvite(req: Request, res: Response) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + INVITE_TTL_MS);
  await prisma.fighterInvite.create({ data: { tokenHash: hashToken(token), clubId: req.clubId!, expiresAt } });
  const origin = process.env.FRONTEND_URL ?? "http://localhost:5173";
  res.status(201).json({ url: `${origin}/combattant/${token}`, expiresAt });
}

/** Page publique du lien : nom du club qui demande la fiche (sans compte). */
export async function getInvite(req: Request, res: Response) {
  const found = await findInvite(String(req.params.token));
  if (!found.ok) {
    res.status(found.status).json({ error: found.error });
    return;
  }
  res.json({ clubName: found.invite.club.name });
}

/** Le combattant envoie sa fiche : elle est créée dans le club et le lien est consommé. */
export async function submitInvite(req: Request, res: Response) {
  const parsed = inviteSubmissionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "validation", issues: z.flattenError(parsed.error) });
    return;
  }
  const found = await findInvite(String(req.params.token));
  if (!found.ok) {
    res.status(found.status).json({ error: found.error });
    return;
  }
  const { invite } = found;
  const { consent: _consent, ...input } = parsed.data;
  const now = new Date();

  const fighterId = await prisma.$transaction(async (tx) => {
    // Réservation atomique : deux envois simultanés ne peuvent pas consommer le même lien.
    const claimed = await tx.fighterInvite.updateMany({
      where: { id: invite.id, usedAt: null, expiresAt: { gt: now } },
      data: { usedAt: now },
    });
    if (claimed.count === 0) return null;
    const fighter = await tx.fighter.create({
      data: { ...toFighterCreateData(input, { consentAt: now }), clubId: invite.clubId },
    });
    await tx.fighterInvite.update({ where: { id: invite.id }, data: { fighterId: fighter.id } });
    return fighter.id;
  });

  if (!fighterId) {
    res.status(410).json({ error: "invite_used" });
    return;
  }
  res.status(201).json({ firstName: input.firstName, clubName: invite.club.name });
}
