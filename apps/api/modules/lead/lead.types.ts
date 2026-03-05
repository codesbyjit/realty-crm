import type { Types } from "mongoose";

export interface ILead {
  name: string;
  email: string;
  phone: string;
  source: string;
  status: string;
  // Visibility control: when false, other AGENTs (non-OWNER) cannot see this lead
  // OWNER can always see all leads regardless of this field
  // Default is true (visible to team)
  isVisibleToTeam: boolean;
  realtorId: Types.ObjectId;
  workspaceId: Types.ObjectId;
  pipelineId: Types.ObjectId;
  stageId?: Types.ObjectId;
  campaignId?: Types.ObjectId;
}

export interface ILeadCreate {
  name: string;
  email: string;
  phone: string;
  source: string;
  realtorId: Types.ObjectId | string;
  workspaceId: Types.ObjectId | string;
  pipelineId?: Types.ObjectId | string;
  stageId?: Types.ObjectId | string;
  campaignId?: Types.ObjectId | string;
  type?: "BUYER" | "SELLER";
  // Visibility control for the lead - AGENTs can toggle this
  // When false, other AGENTs cannot see this lead (only OWNER can)
  isVisibleToTeam?: boolean;
}

export interface IleadOverView {
  name: string;
  email: string;
  phone: string;
  _id: Types.ObjectId;
}

export interface ILeadUpdate {
  name?: string;
  email?: string;
  phone?: string;
  source?: string;
  realtorId?: Types.ObjectId | string;
  pipelineId?: Types.ObjectId | string;
  stageId?: Types.ObjectId | string;
  status?: string;
  // Visibility control - AGENTs can toggle to show/hide their leads from other agents
  isVisibleToTeam?: boolean;
}
