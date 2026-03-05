export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  avatar?: string;
}

export interface Workspace {
  _id: string;
  id?: string;
  name?: string;
  type?: "SOLO" | "TEAM";
  createdAt?: string;
  updatedAt?: string;
}

export interface Membership {
  _id: string;
  workspace: Workspace | string;
  user: User | string;
  role: "OWNER" | "AGENT";
  isAccepted: boolean;
  isRemoved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Pipeline {
  _id: string;
  name: string;
  type: "BUYER" | "SELLER";
  workspaceId: string;
  realtorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PipelineStage {
  _id: string;
  name: string;
  order: number;
  pipelineId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: "new" | "contacted" | "converted" | "lost";
  isVisibleToTeam: boolean;
  workspaceId: string;
  realtorId: string;
  pipelineId: string;
  stageId?: string;
  campaignId?: string;
  createdAt: string;
  updatedAt: string;
  // For display purposes
  realtor?: User;
}

export interface Campaign {
  _id: string;
  name: string;
  workspaceId: string;
  realtorId: string;
  status: "active" | "paused" | "completed";
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token?: string;
  accessToken?: string;
  message?: string;
}

export interface KanbanBoard {
  stages: PipelineStage[];
  leads: Lead[];
}
