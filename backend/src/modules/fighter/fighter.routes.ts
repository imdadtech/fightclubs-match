import { Router } from "express";
import { requireAuth, requireClub } from "../auth/session.js";
import { listOwnFighters } from "./fighter.controller.js";

export const fighterRouter = Router();

fighterRouter.get("/", requireAuth, requireClub, listOwnFighters);
