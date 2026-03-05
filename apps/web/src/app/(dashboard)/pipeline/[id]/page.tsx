"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useAuth } from "@/contexts/AuthContext";
import { Lead, PipelineStage, Pipeline } from "@/lib/types";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus,
  ArrowLeft,
  MoreHorizontal,
  Eye,
  EyeOff,
  Mail,
  Phone,
  GripVertical,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Types
interface StageWithLeads extends PipelineStage {
  leads: Lead[];
}

function LeadCard({
  lead,
  onToggleVisibility,
  isOwner,
  currentUserId,
}: {
  lead: Lead;
  onToggleVisibility: (leadId: string, visible: boolean) => void;
  isOwner: boolean;
  currentUserId: string;
}) {
  const isOwnLead = lead.realtorId === currentUserId;
  const canToggleVisibility = isOwner || isOwnLead;

  const statusColors = {
    new: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    contacted:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
    converted:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    lost: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{lead.name}</h4>
          <p className="text-xs text-muted-foreground truncate">{lead.email}</p>
        </div>
        {canToggleVisibility && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleVisibility(lead._id, !lead.isVisibleToTeam);
                  }}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                >
                  {lead.isVisibleToTeam ? (
                    <Eye className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {lead.isVisibleToTeam
                    ? "Visible to team - click to hide"
                    : "Hidden from team - click to show"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <div className="mt-2 flex items-center gap-2 flex-wrap">
        <Badge variant="secondary" className="text-xs">
          {lead.source}
        </Badge>
        <Badge
          className={`text-xs ${statusColors[lead.status as keyof typeof statusColors]}`}
        >
          {lead.status}
        </Badge>
      </div>

      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
        {lead.phone && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <a href={`tel:${lead.phone}`} className="hover:text-primary">
                  <Phone className="w-3 h-3" />
                </a>
              </TooltipTrigger>
              <TooltipContent>
                <p>{lead.phone}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <a href={`mailto:${lead.email}`} className="hover:text-primary">
                <Mail className="w-3 h-3" />
              </a>
            </TooltipTrigger>
            <TooltipContent>
              <p>{lead.email}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {!lead.isVisibleToTeam && isOwner && (
        <div className="mt-2 flex items-center gap-1 text-xs text-orange-500">
          <EyeOff className="w-3 h-3" />
          Hidden from team
        </div>
      )}
    </div>
  );
}

function SortableLeadCard({
  lead,
  onToggleVisibility,
  isOwner,
  currentUserId,
}: {
  lead: Lead;
  onToggleVisibility: (leadId: string, visible: boolean) => void;
  isOwner: boolean;
  currentUserId: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div className="flex items-center gap-1 mb-1">
        <button
          className="cursor-grab active:cursor-grabbing p-0.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
          {...listeners}
        >
          <GripVertical className="w-3 h-3 text-muted-foreground" />
        </button>
        <div className="flex-1">
          <LeadCard
            lead={lead}
            onToggleVisibility={onToggleVisibility}
            isOwner={isOwner}
            currentUserId={currentUserId}
          />
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({
  stage,
  leads,
  onToggleVisibility,
  isOwner,
  currentUserId,
  onAddLead,
}: {
  stage: StageWithLeads;
  leads: Lead[];
  onToggleVisibility: (leadId: string, visible: boolean) => void;
  isOwner: boolean;
  currentUserId: string;
  onAddLead: (stageId: string) => void;
}) {
  return (
    <div className="flex-shrink-0 w-72">
      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">{stage.name}</h3>
            <Badge variant="secondary" className="text-xs">
              {leads.length}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onAddLead(stage._id)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
          <SortableContext
            items={leads.map((l) => l._id)}
            strategy={verticalListSortingStrategy}
          >
            {leads.map((lead) => (
              <SortableLeadCard
                key={lead._id}
                lead={lead}
                onToggleVisibility={onToggleVisibility}
                isOwner={isOwner}
                currentUserId={currentUserId}
              />
            ))}
          </SortableContext>
          {leads.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No leads in this stage
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function KanbanBoardPage() {
  const params = useParams();
  const router = useRouter();
  const { currentWorkspace, currentMembership } = useWorkspace();
  const { user } = useAuth();
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [stages, setStages] = useState<StageWithLeads[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState<string>("");
  const [newLead, setNewLead] = useState({
    name: "",
    email: "",
    phone: "",
    source: "website",
  });

  const isOwner = currentMembership?.role === "OWNER";
  const currentUserId = user?._id || "";

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor),
  );

  useEffect(() => {
    if (!currentWorkspace || !params.id) return;
    fetchPipelineData();
  }, [currentWorkspace, params.id]);

  const fetchPipelineData = async () => {
    if (!currentWorkspace || !params.id) return;

    setIsLoading(true);
    try {
      const [pipelineRes, stagesRes, leadsRes] = await Promise.all([
        api.get(`/pipeline/details/${params.id}`),
        api.get(`/pipelineStage/pipeline/${params.id}`),
        api.get(`/lead/kanban/${currentWorkspace._id}`),
      ]);

      setPipeline(pipelineRes.data.pipeline);

      const stagesData = stagesRes.data.stages || [];
      const leadsData = leadsRes.data.leads || [];

      // Filter leads for this pipeline
      const pipelineLeads = leadsData.filter(
        (lead: Lead) => lead.pipelineId === params.id,
      );

      // Map leads to stages
      const stagesWithLeads: StageWithLeads[] = stagesData.map(
        (stage: PipelineStage) => ({
          ...stage,
          leads: pipelineLeads.filter(
            (lead: Lead) => lead.stageId === stage._id,
          ),
        }),
      );

      setStages(stagesWithLeads);
      setLeads(pipelineLeads);
    } catch (error) {
      console.error("Failed to fetch pipeline data:", error);
      toast.error("Failed to load pipeline");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeLeadId = active.id as string;
    const overId = over.id as string;

    // Find the source and destination stages
    const activeLead = leads.find((l) => l._id === activeLeadId);
    if (!activeLead) return;

    let destStageId: string | null = null;

    // Check if dropping on a stage (column)
    const destStage = stages.find((s) => s._id === overId);
    if (destStage) {
      destStageId = destStage._id;
    } else {
      // Dropping on another lead - find its stage
      const overLead = leads.find((l) => l._id === overId);
      if (overLead) {
        destStageId = overLead.stageId || null;
      }
    }

    if (destStageId && destStageId !== activeLead.stageId) {
      // Update local state immediately for smooth UX
      setLeads((prev) =>
        prev.map((lead) =>
          lead._id === activeLeadId ? { ...lead, stageId: destStageId! } : lead,
        ),
      );
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeLeadId = active.id as string;
    const activeLead = leads.find((l) => l._id === activeLeadId);
    if (!activeLead) return;

    let destStageId: string | null = null;

    const destStage = stages.find((s) => s._id === over.id);
    if (destStage) {
      destStageId = destStage._id;
    } else {
      const overLead = leads.find((l) => l._id === over.id);
      if (overLead) {
        destStageId = overLead.stageId || null;
      }
    }

    if (destStageId && destStageId !== activeLead.stageId) {
      try {
        await api.put("/pipelineStage/move-lead", {
          leadId: activeLeadId,
          stageId: destStageId,
        });
        toast.success("Lead moved successfully");
      } catch (error) {
        console.error("Failed to move lead:", error);
        toast.error("Failed to move lead");
        // Revert on error
        fetchPipelineData();
      }
    }
  };

  const handleToggleVisibility = async (leadId: string, visible: boolean) => {
    try {
      await api.patch(`/lead/visibility/${leadId}`, {
        isVisibleToTeam: visible,
      });

      setLeads((prev) =>
        prev.map((lead) =>
          lead._id === leadId ? { ...lead, isVisibleToTeam: visible } : lead,
        ),
      );

      toast.success(
        visible
          ? "Lead is now visible to team"
          : "Lead is now hidden from team",
      );
    } catch (error) {
      console.error("Failed to toggle visibility:", error);
      toast.error("Failed to update visibility");
    }
  };

  const handleAddLead = (stageId: string) => {
    setSelectedStageId(stageId);
    setIsAddLeadOpen(true);
  };

  const handleCreateLead = async () => {
    if (!newLead.name.trim() || !currentWorkspace) {
      toast.error("Please enter lead name");
      return;
    }

    try {
      const response = await api.post("/lead/create", {
        ...newLead,
        workspaceId: currentWorkspace._id,
        pipelineId: params.id,
        stageId: selectedStageId || stages[0]?._id,
        type: pipeline?.type === "SELLER" ? "SELLER" : "BUYER",
      });

      const createdLead = response.data.lead;
      setLeads((prev) => [...prev, createdLead]);

      // Update stages with new lead
      setStages((prev) =>
        prev.map((stage) =>
          stage._id === createdLead.stageId
            ? { ...stage, leads: [...stage.leads, createdLead] }
            : stage,
        ),
      );

      setIsAddLeadOpen(false);
      setNewLead({ name: "", email: "", phone: "", source: "website" });
      toast.success("Lead created successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create lead");
    }
  };

  const activeLead = activeId ? leads.find((l) => l._id === activeId) : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/pipeline")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {pipeline?.name || "Kanban Board"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {pipeline?.type === "BUYER"
                ? "Buyer Pipeline"
                : "Seller Pipeline"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isOwner && (
            <Badge variant="outline" className="text-xs">
              Owner View - All Leads Visible
            </Badge>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-200px)]">
          {stages.map((stage) => (
            <KanbanColumn
              key={stage._id}
              stage={stage}
              leads={leads.filter((l) => l.stageId === stage._id)}
              onToggleVisibility={handleToggleVisibility}
              isOwner={isOwner}
              currentUserId={currentUserId}
              onAddLead={handleAddLead}
            />
          ))}
        </div>

        <DragOverlay>
          {activeLead && (
            <div className="w-72">
              <LeadCard
                lead={activeLead}
                onToggleVisibility={() => {}}
                isOwner={isOwner}
                currentUserId={currentUserId}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Add Lead Dialog */}
      <Dialog open={isAddLeadOpen} onOpenChange={setIsAddLeadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
            <DialogDescription>Enter the lead details below</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="leadName">Name *</Label>
              <Input
                id="leadName"
                placeholder="John Doe"
                value={newLead.name}
                onChange={(e) =>
                  setNewLead({ ...newLead, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="leadEmail">Email</Label>
              <Input
                id="leadEmail"
                type="email"
                placeholder="john@example.com"
                value={newLead.email}
                onChange={(e) =>
                  setNewLead({ ...newLead, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="leadPhone">Phone</Label>
              <Input
                id="leadPhone"
                placeholder="+1 234 567 8900"
                value={newLead.phone}
                onChange={(e) =>
                  setNewLead({ ...newLead, phone: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Source</Label>
              <Select
                value={newLead.source}
                onValueChange={(value) =>
                  setNewLead({ ...newLead, source: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="social">Social Media</SelectItem>
                  <SelectItem value="ads">Paid Ads</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddLeadOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateLead}>Create Lead</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
