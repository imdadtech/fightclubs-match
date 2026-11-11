import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../../db/prisma.js";
import { toFighterDto, withClub } from "../fighter/fighter.dto.js";
import { compare } from "./compatibility.js";
import { detailQuerySchema, searchQuerySchema } from "./opponent.schemas.js";

const invalid = (res: Response, error: z.ZodError) =>
  res.status(400).json({ error: "validation", issues: z.flattenError(error) });

/** Combattants des autres clubs qui correspondent aux critères pour un de tes combattants. */
export async function searchOpponents(req: Request, res: Response) {
  const parsed = searchQuerySchema.safeParse(req.query);
  if (!parsed.success) return invalid(res, parsed.error);
  const q = parsed.data;

  const own = await prisma.fighter.findFirst({ where: { id: q.fighterId, clubId: req.clubId }, include: withClub });
  if (!own) return res.status(404).json({ error: "fighter_not_found" });

  const found = await prisma.fighter.findMany({
    where: {
      clubId: { not: req.clubId },
      discipline: q.discipline,
      weightClassesKg: { hasSome: q.weights },
      fights: { gte: q.minFights, lte: q.maxFights },
      wins: { gte: q.minWins },
      losses: { lte: q.maxLosses },
      ...(q.month && { availableMonths: { has: q.month } }),
    },
    include: withClub,
  });

  const results = found
    .map((f) => ({ fighter: toFighterDto(f), ...compare(own, f, q.weights), gap: Math.abs(own.fights - f.fights) }))
    .sort((a, b) => Number(b.compatibility === "very") - Number(a.compatibility === "very") || a.gap - b.gap)
    .map(({ gap: _gap, ...r }) => r);

  res.json({ fighter: toFighterDto(own), total: results.length, results });
}

/** Fiche d'un adversaire, comparée à un de tes combattants. */
export async function getOpponent(req: Request, res: Response) {
  const parsed = detailQuerySchema.safeParse(req.query);
  if (!parsed.success) return invalid(res, parsed.error);

  const [own, opponent] = await Promise.all([
    prisma.fighter.findFirst({ where: { id: parsed.data.fighterId, clubId: req.clubId }, include: withClub }),
    prisma.fighter.findFirst({ where: { id: String(req.params.id), clubId: { not: req.clubId } }, include: withClub }),
  ]);
  if (!own || !opponent) return res.status(404).json({ error: "fighter_not_found" });

  res.json({ fighter: toFighterDto(own), opponent: toFighterDto(opponent), ...compare(own, opponent) });
}
