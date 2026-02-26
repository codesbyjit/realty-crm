import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./requireAuth";

function requireRole(role: string) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const authUser = (req as AuthenticatedRequest).user;

        if (!authUser) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        if (authUser.role !== role) {
            res.status(403).json({ message: "Forbidden: insufficient permissions" });
            return;
        }

        next();
    };
}

export default requireRole;
