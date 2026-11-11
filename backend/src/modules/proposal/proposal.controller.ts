import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../../db/prisma.js";
import { toFighterDto, withRelations } from "../fighter/fighter.dto.js";
import { createProposalSchema, listProposalsQuerySchema } from "./proposal.schemas.js";

const fighterInclude = { include: withRelations } as const;
const proposalInclude = { fromFighter: fighterInclude, toFighter: fighterInclude } as const;

type ProposalRow = NonNullable<Awaited<ReturnType<typeof findProposal>>>;
const findProposal = (id: string) => prisma.proposal.findUnique({ where: { id }, include: proposalInclude });

const toProposalDto = (p: ProposalRow, clubId: string) => ({
  id: p.id,
  status: p.status,
  weightClassKg: p.weightClassKg,
  desiredMonth: p.desiredMonth,
  createdAt: p.createdAt,
  respondedAt: p.respondedAt,
  direction: p.toFighter.clubId === clubId ? ("received" as const) : ("sent" as const),
  from: toFighterDto(p.fromFighter),
  to: toFighterDto(p.toFighter),
});

/** Charge une proposition à laquelle le club connecté participe (sinon 404, sans révéler son existence). */
async function loadFor(req: Request, res: Response) {
  const p = await findProposal(String(req.params.id));
  if (!p || (p.fromFighter.clubId !== req.clubId && p.toFighter.clubId !== req.clubId)) {
    res.status(404).json({ error: "proposal_not_found" });
    return undefined;
  }
  return p;
}

export async function createProposal(req: Request, res: Response) {
  const parsed = createProposalSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "validation", issues: z.flattenError(parsed.error) });
  const { fromFighterId, toFighterId, weightClassKg, desiredMonth } = parsed.data;

  const [from, to] = await Promise.all([
    prisma.fighter.findFirst({ where: { id: fromFighterId, clubId: req.clubId } }),
    prisma.fighter.findFirst({ where: { id: toFighterId, clubId: { not: req.clubId } } }),
  ]);
  if (!from || !to) return res.status(404).json({ error: "fighter_not_found" });

  const existing = await prisma.proposal.findFirst({
    where: { fromFighterId, toFighterId, status: { in: ["PENDING", "ACCEPTED"] } },
  });
  if (existing) return res.status(409).json({ error: "already_proposed" });

  const created = await prisma.proposal.create({
    data: { fromFighterId, toFighterId, weightClassKg, desiredMonth },
    include: proposalInclude,
  });
  res.status(201).json(toProposalDto(created, req.clubId!));
}

/** `received` : propositions faites à mes combattants ; `sent` : celles que j'ai envoyées. */
export async function listProposals(req: Request, res: Response) {
  const parsed = listProposalsQuerySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: "validation", issues: z.flattenError(parsed.error) });
  const side = parsed.data.box === "received" ? "toFighter" : "fromFighter";

  const proposals = await prisma.proposal.findMany({
    where: { [side]: { clubId: req.clubId } },
    include: proposalInclude,
    orderBy: { createdAt: "desc" },
  });
  res.json(proposals.map((p) => toProposalDto(p, req.clubId!)));
}

async function respond(req: Request, res: Response, status: "ACCEPTED" | "DECLINED") {
  const p = await loadFor(req, res);
  if (!p) return;
  if (p.toFighter.clubId !== req.clubId) return res.status(403).json({ error: "not_recipient" });
  if (p.status !== "PENDING") return res.status(409).json({ error: "already_answered" });

  const updated = await prisma.proposal.update({
    where: { id: p.id },
    data: { status, respondedAt: new Date() },
    include: proposalInclude,
  });
  res.json(toProposalDto(updated, req.clubId!));
}

export const acceptProposal = (req: Request, res: Response) => respond(req, res, "ACCEPTED");
export const declineProposal = (req: Request, res: Response) => respond(req, res, "DECLINED");

/**
 * Coordonnées de l'autre club, uniquement après acceptation et seulement pour les deux clubs concernés.
 * Chaque canal n'est donné que si le club l'a accepté à l'inscription.
 */
export async function getContact(req: Request, res: Response) {
  const p = await loadFor(req, res);
  if (!p) return;
  if (p.status !== "ACCEPTED") return res.status(403).json({ error: "not_accepted" });

  const mine = p.fromFighter.clubId === req.clubId ? "from" : "to";
  const other = mine === "from" ? p.toFighter : p.fromFighter;
  const club = await prisma.club.findUniqueOrThrow({
    where: { id: other.clubId },
    include: { users: { select: { email: true }, orderBy: { createdAt: "asc" }, take: 1 } },
  });

  const phone = club.sharePhone ? club.contactPhone : null;
  res.json({
    proposal: toProposalDto(p, req.clubId!),
    club: { name: club.name, city: club.city, postalCode: club.postalCode },
    contact: {
      whatsapp: phone && club.phoneHasWhatsapp ? phone : null,
      email: club.shareEmail ? (club.users[0]?.email ?? null) : null,
      phone,
    },
    confirmation: {
      mine: Boolean(mine === "from" ? p.fromConfirmedAt : p.toConfirmedAt),
      theirs: Boolean(mine === "from" ? p.toConfirmedAt : p.fromConfirmedAt),
    },
  });
}

/** Le club déclare le combat confirmé ; il l'est vraiment quand les deux clubs l'ont fait. */
export async function confirmProposal(req: Request, res: Response) {
  const p = await loadFor(req, res);
  if (!p) return;
  if (p.status !== "ACCEPTED") return res.status(403).json({ error: "not_accepted" });
  const field = p.fromFighter.clubId === req.clubId ? "fromConfirmedAt" : "toConfirmedAt";
  await prisma.proposal.update({ where: { id: p.id }, data: { [field]: p[field] ?? new Date() } });
  return getContact(req, res);
}
