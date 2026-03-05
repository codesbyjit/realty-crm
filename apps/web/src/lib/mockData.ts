import { Pipeline, Lead, PipelineStage, Campaign, Membership } from "./types";

// Dummy data for development - can be easily connected to real API later
// Set USE_MOCK_DATA=true in .env.local to always use dummy data

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

class MockDataService {
  // Pipelines
  static getPipelines(workspaceId?: string): Pipeline[] {
    if (!USE_MOCK_DATA) return [];
    return [
      {
        _id: "pipeline-1",
        name: "Buyer Pipeline",
        type: "BUYER",
        workspaceId: workspaceId || "ws-1",
        realtorId: "user-1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: "pipeline-2",
        name: "Seller Pipeline",
        type: "SELLER",
        workspaceId: workspaceId || "ws-1",
        realtorId: "user-1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  // Pipeline Stages
  static getPipelineStages(pipelineId: string): PipelineStage[] {
    if (!USE_MOCK_DATA) return [];
    return [
      {
        _id: "stage-1",
        name: "New Lead",
        order: 0,
        pipelineId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: "stage-2",
        name: "Contacted",
        order: 1,
        pipelineId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: "stage-3",
        name: "Qualified",
        order: 2,
        pipelineId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: "stage-4",
        name: "Proposal",
        order: 3,
        pipelineId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: "stage-5",
        name: "Closed Won",
        order: 4,
        pipelineId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  // Leads
  static getLeads(workspaceId?: string): Lead[] {
    if (!USE_MOCK_DATA) return [];
    return [
      {
        _id: "lead-1",
        name: "John Smith",
        email: "john@example.com",
        phone: "+1234567890",
        source: "Website",
        status: "new",
        isVisibleToTeam: true,
        workspaceId: workspaceId || "ws-1",
        realtorId: "user-1",
        pipelineId: "pipeline-1",
        stageId: "stage-1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: "lead-2",
        name: "Sarah Johnson",
        email: "sarah@example.com",
        phone: "+1234567891",
        source: "Referral",
        status: "contacted",
        isVisibleToTeam: true,
        workspaceId: workspaceId || "ws-1",
        realtorId: "user-1",
        pipelineId: "pipeline-1",
        stageId: "stage-2",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: "lead-3",
        name: "Mike Davis",
        email: "mike@example.com",
        phone: "+1234567892",
        source: "Social",
        status: "converted",
        isVisibleToTeam: true,
        workspaceId: workspaceId || "ws-1",
        realtorId: "user-1",
        pipelineId: "pipeline-1",
        stageId: "stage-5",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: "lead-4",
        name: "Emily Brown",
        email: "emily@example.com",
        phone: "+1234567893",
        source: "Ads",
        status: "new",
        isVisibleToTeam: false,
        workspaceId: workspaceId || "ws-1",
        realtorId: "user-1",
        pipelineId: "pipeline-1",
        stageId: "stage-1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: "lead-5",
        name: "Chris Wilson",
        email: "chris@example.com",
        phone: "+1234567894",
        source: "Website",
        status: "contacted",
        isVisibleToTeam: true,
        workspaceId: workspaceId || "ws-1",
        realtorId: "user-2",
        pipelineId: "pipeline-1",
        stageId: "stage-3",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  // Campaigns
  static getCampaigns(workspaceId?: string): Campaign[] {
    if (!USE_MOCK_DATA) return [];
    return [
      {
        _id: "campaign-1",
        name: "Summer Sale 2024",
        workspaceId: workspaceId || "ws-1",
        realtorId: "user-1",
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: "campaign-2",
        name: "Winter Campaign",
        workspaceId: workspaceId || "ws-1",
        realtorId: "user-1",
        status: "paused",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: "campaign-3",
        name: "New Year Special",
        workspaceId: workspaceId || "ws-1",
        realtorId: "user-1",
        status: "completed",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  // Team Members
  static getTeamMembers(workspaceId?: string): Membership[] {
    if (!USE_MOCK_DATA) return [];
    return [
      {
        _id: "member-1",
        workspace: workspaceId || "ws-1",
        user: {
          _id: "user-1",
          name: "You",
          email: "you@example.com",
          role: "user",
        },
        role: "OWNER",
        isAccepted: true,
        isRemoved: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: "member-2",
        workspace: workspaceId || "ws-1",
        user: {
          _id: "user-2",
          name: "Jane Agent",
          email: "jane@example.com",
          role: "user",
        },
        role: "AGENT",
        isAccepted: true,
        isRemoved: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: "member-3",
        workspace: workspaceId || "ws-1",
        user: {
          _id: "user-3",
          name: "Bob Agent",
          email: "bob@example.com",
          role: "user",
        },
        role: "AGENT",
        isAccepted: true,
        isRemoved: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }
}

export const mockData = {
  getPipelines: MockDataService.getPipelines,
  getPipelineStages: MockDataService.getPipelineStages,
  getLeads: MockDataService.getLeads,
  getCampaigns: MockDataService.getCampaigns,
  getTeamMembers: MockDataService.getTeamMembers,
};
