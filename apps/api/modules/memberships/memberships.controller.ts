import type { Request, Response } from "express";
import { addMembersSchema, updateMemberSchema } from "./memberships.types";
import { membershipService } from "./memberships.service";

// ── POST /memberships/add-members ────────────────────────────────────
export const addMembers = async (req: Request, res: Response) => {
    try {
        const { workspaceId, users } = addMembersSchema.parse(req.body);
        const memberships = await membershipService.createManyMemberships(workspaceId, users);
        res.status(201).json({ message: "Members added successfully", memberships });
    } catch (error) {
        res.status(500).json({ message: "Failed to add members" });
    }
};

// ── GET /memberships/workspace/:workspaceId ──────────────────────────
export const getMembers = async (req: Request, res: Response) => {
    try {
        const workspaceId = req.params.workspaceId as string;
        const members = await membershipService.getMembersByWorkspace(workspaceId);
        res.status(200).json(members);
    } catch (error) {
        res.status(500).json({ message: "Failed to get members" });
    }
};

// ── GET /memberships/:id ─────────────────────────────────────────────
export const getMember = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const membership = await membershipService.getMembershipById(id);
        if (!membership) {
            res.status(404).json({ message: "Membership not found" });
            return;
        }
        res.status(200).json(membership);
    } catch (error) {
        res.status(500).json({ message: "Failed to get membership" });
    }
};

// ── PATCH /memberships/:id ───────────────────────────────────────────
export const updateMember = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const data = updateMemberSchema.parse(req.body);
        const membership = await membershipService.updateMembership(id, data);
        if (!membership) {
            res.status(404).json({ message: "Membership not found" });
            return;
        }
        res.status(200).json(membership);
    } catch (error) {
        res.status(500).json({ message: "Failed to update membership" });
    }
};

// ── DELETE /memberships/:id ──────────────────────────────────────────
export const removeMember = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const membership = await membershipService.removeMembership(id);
        if (!membership) {
            res.status(404).json({ message: "Membership not found" });
            return;
        }
        res.status(200).json({ message: "Member removed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to remove member" });
    }
};
