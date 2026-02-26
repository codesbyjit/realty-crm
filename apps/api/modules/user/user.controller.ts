import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../shared/middleware/requireAuth";
import { userService } from "./user.service";

export async function getMe(req: Request, res: Response): Promise<void> {
    const authUser = (req as AuthenticatedRequest).user;
    res.json({ user: authUser });
}

export async function getAllUsers(
    _req: Request,
    res: Response,
): Promise<void> {
    try {
        const users = await userService.getAllUsers();
        res.status(200).json({
            totalUsers: users.length,
            users,
        });
    } catch {
        res.status(500).json({ message: "Internal server error" });
    }
}
