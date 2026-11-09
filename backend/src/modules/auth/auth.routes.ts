import { Router } from "express";
import { requireAuth } from "./session.js";
import { login, logout, me, signupClub } from "./auth.controller.js";

export const authRouter = Router();

authRouter.post("/signup/club", signupClub);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/me", requireAuth, me);
