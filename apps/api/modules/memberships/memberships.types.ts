import { z } from "zod";

export const addMembersSchema = z.object({
    workspaceId: z.string().min(1, "Workspace ID is required"),
    users: z.array(z.string()).min(1, "Users are required"),
});

export const updateMemberSchema = z.object({
    role: z.enum(["OWNER", "AGENT"]).optional(),
    isAccepted: z.boolean().optional(),
});

export type AddMembersInput = z.infer<typeof addMembersSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;

export interface CreateMembershipInput {
    workspace: string;
    user: string;
    role: "OWNER" | "AGENT";
}
