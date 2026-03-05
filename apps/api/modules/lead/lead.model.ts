import mongoose from "mongoose";
import type { ILead } from "./lead.types";

const leadSchema = new mongoose.Schema<ILead>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      required: true,
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    realtorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pipelineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pipeline",
      required: true,
    },
    stageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PipelineStage",
    },
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaing",
    },
    status: {
      type: String,
      enum: ["new", "contacted", "converted", "lost"],
      default: "new",
    },
    // Visibility control: when false, other AGENTs (non-OWNER) cannot see this lead
    // OWNER can always see all leads regardless of this field
    // Default is true (visible to team)
    isVisibleToTeam: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

leadSchema.index({ workspaceId: 1, realtorId: 1 });
leadSchema.index({ campaignId: 1, realtorId: 1, workspaceId: 1 });

export const Lead = mongoose.model<ILead>("Lead", leadSchema);
