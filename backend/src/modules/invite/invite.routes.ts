import { Router } from "express";
import { requireAuth, requireClub } from "../auth/session.js";
import { createInvite, getInvite, submitInvite } from "./invite.controller.js";

export const inviteRouter = Router();

// Côté club (connecté)
inviteRouter.post("/", requireAuth, requireClub, createInvite);

// Côté combattant (public, sans compte : le jeton du lien fait foi)
inviteRouter.get("/:token", getInvite);
inviteRouter.post("/:token", submitInvite);
