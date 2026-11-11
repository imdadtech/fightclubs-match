import type { Request, Response } from "express";
import { prisma } from "../../db/prisma.js";
import { toFighterDto, withClub } from "./fighter.dto.js";

/** Combattants du club connecté. */
export async function listOwnFighters(req: Request, res: Response) {
  const fighters = await prisma.fighter.findMany({
    where: { clubId: req.clubId },
    include: withClub,
    orderBy: { firstName: "asc" },
  });
  res.json(fighters.map(toFighterDto));
}
