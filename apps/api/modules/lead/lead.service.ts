import { Lead } from "./lead.model";
import type { ILeadCreate, IleadOverView, ILeadUpdate } from "./lead.types";
import { Membership } from "../memberships/memberships.model";
import { ensureDefaultPipelines } from "../pipeline/pipeline.seed";

export class LeadService {
  static async createLead(leadData: ILeadCreate) {
    const checkWorkspace = await Membership.findOne({
      workspace: leadData.workspaceId,
      user: leadData.realtorId,
      isRemoved: false,
    });
    if (!checkWorkspace) {
      throw new Error("You are not a member of this workspace");
    }

    // Auto-assign pipeline and stage if not provided
    if (!leadData.pipelineId) {
      const defaults = await ensureDefaultPipelines(
        leadData.workspaceId as string,
        leadData.realtorId as string,
      );
      const pipelineType = leadData.type === "SELLER" ? "seller" : "buyer";
      leadData.pipelineId = defaults[pipelineType].pipelineId;
      if (!leadData.stageId) {
        leadData.stageId = defaults[pipelineType].firstStageId;
      }
    }

    const lead = new Lead(leadData);
    return await lead.save();
  }

  static async getLeads(workspaceId: string, realtorId: string) {
    const membership = await Membership.findOne({
      workspace: workspaceId,
      user: realtorId,
      isRemoved: false,
    });
    if (!membership) {
      throw new Error("You are not a member of this workspace");
    }
    const roleInWorkspace = membership.role;

    // OWNER role: can see ALL leads including hidden ones (isVisibleToTeam: false)
    // This gives workspace head complete visibility over all leads
    if (roleInWorkspace === "OWNER") {
      const leadDetails: IleadOverView[] = await Lead.find({ workspaceId })
        .select("name email phone _id")
        .lean();
      return leadDetails;
    }

    // AGENT role: can see:
    // 1. Their own leads (regardless of isVisibleToTeam)
    // 2. Other agents' leads WHERE isVisibleToTeam is true
    const leadDetails: IleadOverView[] = await Lead.find({
      workspaceId,
      $or: [
        { realtorId: realtorId }, // Own leads
        { isVisibleToTeam: true }, // Other agents' shared leads
      ],
    })
      .select("name email phone _id")
      .lean();
    return leadDetails;
  }

  static async getLeadDetails(realtorId: string, leadId: string) {
    // Returns lead details including isVisibleToTeam for Kanban board display
    // Note: Only the lead owner can view full details (to protect privacy)
    return await Lead.findOne({ realtorId, _id: leadId }).lean();
  }

  // Get all leads for Kanban board - respects visibility rules
  static async getLeadsForKanban(workspaceId: string, realtorId: string) {
    const membership = await Membership.findOne({
      workspace: workspaceId,
      user: realtorId,
      isRemoved: false,
    });
    if (!membership) {
      throw new Error("You are not a member of this workspace");
    }
    const roleInWorkspace = membership.role;

    if (roleInWorkspace === "OWNER") {
      // OWNER sees ALL leads including hidden ones
      return await Lead.find({ workspaceId }).lean();
    }

    // AGENT sees own leads + shared leads
    return await Lead.find({
      workspaceId,
      $or: [{ realtorId: realtorId }, { isVisibleToTeam: true }],
    }).lean();
  }

  static async updateLead(
    realtorId: string,
    leadId: string,
    leadData: ILeadUpdate,
  ) {
    return await Lead.findOneAndUpdate({ realtorId, _id: leadId }, leadData, {
      new: true,
      runValidators: true,
    }).lean();
  }

  static async deleteLead(realtorId: string, leadId: string) {
    return await Lead.findOneAndDelete({ realtorId, _id: leadId }).lean();
  }

  static async addLeads(
    leads: ILeadCreate[],
    realtorId: string,
    workspaceId: string,
    pipelineId?: string,
    campaignId?: string,
  ) {
    const checkWorkspace = await Membership.findOne({
      workspace: workspaceId,
      user: realtorId,
      isRemoved: false,
    });
    if (!checkWorkspace) {
      throw new Error("You are not a member of this workspace");
    }

    // Auto-assign pipeline if not provided
    let defaultPipelineId = pipelineId;
    let defaultStageId: string | undefined;
    if (!defaultPipelineId) {
      const defaults = await ensureDefaultPipelines(workspaceId, realtorId);
      defaultPipelineId = defaults.buyer.pipelineId?.toString();
      defaultStageId = defaults.buyer.firstStageId?.toString();
    }

    const newLeads: ILeadCreate[] = leads.map((lead) => ({
      ...lead,
      realtorId: realtorId,
      workspaceId: workspaceId,
      pipelineId: lead.pipelineId || defaultPipelineId,
      stageId: lead.stageId || defaultStageId,
      campaignId: campaignId,
    }));

    const insertedLeads = await Lead.insertMany(newLeads);
    return insertedLeads;
  }

  static async assignCampaingToLeads(
    leads: string[],
    campaignId: string,
    userId: string,
    workspaceId: string,
  ) {
    const checkWorkspace = await Membership.findOne({
      workspace: workspaceId,
      user: userId,
      isRemoved: false,
    });
    if (!checkWorkspace) {
      throw new Error("You are not a member of this workspace");
    }
    const updatedLeads = await Lead.updateMany(
      { _id: { $in: leads }, realtorId: userId, workspaceId },
      { $set: { campaignId } },
    );
    return updatedLeads;
  }

  static async getLeadsByCampaing(
    campaignId: string,
    userId: string,
    workspaceId: string,
  ) {
    const checkWorkspace = await Membership.findOne({
      workspace: workspaceId,
      user: userId,
      isRemoved: false,
    });
    if (!checkWorkspace) {
      throw new Error("You are not a member of this workspace");
    }
    const leads = await Lead.find({
      campaignId,
      realtorId: userId,
      workspaceId,
    }).lean();
    return leads;
  }
}
