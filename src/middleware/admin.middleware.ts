import { Request, Response, NextFunction } from "express";
import { requireAuth, requireRole } from "./auth.middleware";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
    return requireAuth(req, res, () => requireRole("admin")(req, res, next));
}
