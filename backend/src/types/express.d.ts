import type { User } from "../generated/prisma/client.js";

declare global {
  namespace Express {
    interface Request {
      user?: Omit<User, "passwordHash"> & { club: { id: string; name: string } | null };
      /** Défini par `requireClub`. */
      clubId?: string;
    }
  }
}

export {};
