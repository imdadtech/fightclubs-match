import { Router } from "express";
import { requireAuth, requireClub } from "../auth/session.js";
import { createFighter, listOwnFighters } from "./fighter.controller.js";

export const fighterRouter = Router();

fighterRouter.use(requireAuth, requireClub);
fighterRouter.get("/", listOwnFighters);
fighterRouter.post("/", createFighter);
