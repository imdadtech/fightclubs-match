import { Router } from "express";
import { requireAuth, requireClub } from "../auth/session.js";
import { getOpponent, searchOpponents } from "./opponent.controller.js";

export const opponentRouter = Router();

opponentRouter.use(requireAuth, requireClub);
opponentRouter.get("/", searchOpponents);
opponentRouter.get("/:id", getOpponent);
