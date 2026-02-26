import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../../shared/middleware/requireAuth";
import { workspaceService } from "./workspace.service";
import { membershipService } from "../memberships/memberships.service";
import { createWorkspaceSchema } from "./workspace.types";

export const createWorkspace = async (req: Request, res: Response) => {
    try {
        const { name } = createWorkspaceSchema.parse(req.body);
        const authUser = req as AuthenticatedRequest;
        const workspace = await workspaceService.createWorkspace(name);
        await membershipService.createMembership(
            String(workspace._id),
            authUser.user.id,
            "OWNER"
        );
        res.status(201).json(workspace);
    } catch (error) {
        res.status(500).json({ message: "Failed to create workspace" });
    }
};