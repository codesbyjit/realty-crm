import { Workspace } from "./workspace.model";

class WorkspaceService {
    async createWorkspace(name: string) {
        const workspace = await Workspace.create({ name, type: "SOLO" });
        return workspace;
    }
}

export const workspaceService = new WorkspaceService();