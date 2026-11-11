import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../../db/prisma.js";
import { toFighterCreateData, toFighterDto, withRelations } from "./fighter.dto.js";
import { fighterInputSchema } from "./fighter.schemas.js";

/** Combattants du club connecté. */
export async function listOwnFighters(req: Request, res: Response) {
  const fighters = await prisma.fighter.findMany({
    where: { clubId: req.clubId },
    include: withRelations,
    orderBy: { firstName: "asc" },
  });
  res.json(fighters.map((f) => toFighterDto(f)));
}

/** Le club connecté ajoute lui-même un combattant. */
export async function createFighter(req: Request, res: Response) {
  const parsed = fighterInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "validation", issues: z.flattenError(parsed.error) });
    return;
  }
  const fighter = await prisma.fighter.create({
    data: { ...toFighterCreateData(parsed.data), clubId: req.clubId! },
    include: withRelations,
  });
  res.status(201).json(toFighterDto(fighter));
}
