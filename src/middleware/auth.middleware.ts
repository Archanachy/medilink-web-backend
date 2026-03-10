import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../configs";

type JwtPayload = {
    id?: string;
    role?: string;
    email?: string;
    username?: string;
};

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;
        console.log("[AuthMiddleware] requireAuth called");
        console.log("[AuthMiddleware] authHeader:", authHeader ? `${authHeader.substring(0, 30)}...` : "MISSING");
        
        if (!authHeader?.startsWith("Bearer ")) {
            console.warn("[AuthMiddleware] No Bearer token - returning 401");
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const token = authHeader.replace("Bearer ", "").trim();
        console.log("[AuthMiddleware] Token extracted, length:", token.length);
        
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        console.log("[AuthMiddleware] Token decoded successfully");
        console.log("[AuthMiddleware] Decoded payload:", {
            id: decoded?.id,
            role: decoded?.role,
            email: decoded?.email,
        });

        req.user = {
            id: decoded?.id,
            role: decoded?.role,
            email: decoded?.email,
            username: decoded?.username,
        };

        console.log("[AuthMiddleware] req.user set:", req.user);
        return next();
    } catch (error: any) {
        console.error("[AuthMiddleware] ERROR:", error.message);
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
}

export function requireRole(...roles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user?.role) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: "Forbidden" });
        }

        return next();
    };
}
