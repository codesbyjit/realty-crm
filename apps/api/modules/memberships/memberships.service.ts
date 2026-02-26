import { Membership } from "./memberships.model";

class MembershipService {
    async createMembership(workspaceId: string, userId: string, role: "OWNER" | "AGENT") {
        return Membership.create({
            workspace: workspaceId,
            user: userId,
            role,
        });
    }

    async createManyMemberships(workspaceId: string, userIds: string[], role: "OWNER" | "AGENT" = "AGENT") {
        return Membership.insertMany(
            userIds.map((userId) => ({
                workspace: workspaceId,
                user: userId,
                role,
            }))
        );
    }

    async getMembersByWorkspace(workspaceId: string) {
        return Membership.find({ workspace: workspaceId, isRemoved: false })
            .populate("user", "name email")
            .sort({ createdAt: -1 });
    }

    async getMembershipById(membershipId: string) {
        return Membership.findById(membershipId)
            .populate("user", "name email")
            .populate("workspace", "name type");
    }

    async updateMembership(membershipId: string, data: { role?: "OWNER" | "AGENT"; isAccepted?: boolean }) {
        return Membership.findByIdAndUpdate(membershipId, data, { new: true })
            .populate("user", "name email");
    }

    async removeMembership(membershipId: string) {
        return Membership.findByIdAndUpdate(membershipId, { isRemoved: true }, { new: true });
    }
}

export const membershipService = new MembershipService();
