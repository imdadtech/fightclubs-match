import { Router } from "express";
import { requireAuth, requireClub } from "../auth/session.js";
import {
  acceptProposal,
  confirmProposal,
  createProposal,
  declineProposal,
  getContact,
  listProposals,
} from "./proposal.controller.js";

export const proposalRouter = Router();

proposalRouter.use(requireAuth, requireClub);
proposalRouter.post("/", createProposal);
proposalRouter.get("/", listProposals);
proposalRouter.post("/:id/accept", acceptProposal);
proposalRouter.post("/:id/decline", declineProposal);
proposalRouter.get("/:id/contact", getContact);
proposalRouter.post("/:id/confirm", confirmProposal);
