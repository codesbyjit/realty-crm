"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useAuth } from "@/contexts/AuthContext";
import { Lead } from "@/lib/types";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  MoreHorizontal,
  Eye,
  EyeOff,
  Phone,
  Mail,
  Trash2,
  Edit,
  Search,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export default function LeadsPage() {
  const router = useRouter();
  const { currentWorkspace, currentMembership } = useWorkspace();
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editLead, setEditLead] = useState({
    name: "",
    email: "",
    phone: "",
    source: "",
    status: "",
  });

  const isOwner = currentMembership?.role === "OWNER";

  useEffect(() => {
    if (!currentWorkspace) return;
    fetchLeads();
  }, [currentWorkspace]);

  const fetchLeads = async () => {
    if (!currentWorkspace) return;
    try {
      const response = await api.get(`/lead/workspace/${currentWorkspace._id}`);
      setLeads(response.data.leads || []);
    } catch (error) {
      console.error("Failed to fetch leads:", error);
    } finally {
      setIsLoading(false);
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
      toast.error("Failed to update visibility");
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;

    try {
      await api.delete(`/lead/details/${leadId}`);
      setLeads((prev) => prev.filter((l) => l._id !== leadId));
      toast.success("Lead deleted");
    } catch (error) {
      toast.error("Failed to delete lead");
    }
  };

  const handleEditLead = (lead: Lead) => {
    setSelectedLead(lead);
    setEditLead({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      source: lead.source,
      status: lead.status,
    });
    setIsEditOpen(true);
  };

  const handleSaveLead = async () => {
    if (!selectedLead) return;

    try {
      const response = await api.put(
        `/lead/details/${selectedLead._id}`,
        editLead,
      );
      setLeads((prev) =>
        prev.map((lead) =>
          lead._id === selectedLead._id ? response.data.lead : lead,
        ),
      );
      setIsEditOpen(false);
      toast.success("Lead updated");
    } catch (error) {
      toast.error("Failed to update lead");
    }
  };

  // Filter leads
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusColors = {
    new: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    contacted:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
    converted:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    lost: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
  };

  if (!currentWorkspace) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-muted-foreground">Please select a workspace first</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leads</h1>
          <p className="text-muted-foreground">Manage your leads</p>
        </div>
        {isOwner && (
          <Badge variant="outline" className="text-xs">
            Owner View - All Leads Visible
          </Badge>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Leads Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No leads found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => {
                  const isOwnLead = lead.realtorId === user?._id;
                  const canToggleVisibility = isOwner || isOwnLead;

                  return (
                    <TableRow key={lead._id}>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <a
                                  href={`mailto:${lead.email}`}
                                  className="hover:text-primary"
                                >
                                  <Mail className="w-4 h-4" />
                                </a>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{lead.email}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          {lead.phone && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <a
                                    href={`tel:${lead.phone}`}
                                    className="hover:text-primary"
                                  >
                                    <Phone className="w-4 h-4" />
                                  </a>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{lead.phone}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{lead.source}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            statusColors[
                              lead.status as keyof typeof statusColors
                            ]
                          }
                        >
                          {lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {canToggleVisibility ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleToggleVisibility(
                                lead._id,
                                !lead.isVisibleToTeam,
                              )
                            }
                          >
                            {lead.isVisibleToTeam ? (
                              <>
                                <Eye className="w-4 h-4 mr-1" />
                                Visible
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-4 h-4 mr-1" />
                                Hidden
                              </>
                            )}
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            {lead.isVisibleToTeam ? "Visible" : "Hidden"}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditLead(lead)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            {canToggleVisibility && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleToggleVisibility(
                                    lead._id,
                                    !lead.isVisibleToTeam,
                                  )
                                }
                              >
                                {lead.isVisibleToTeam ? (
                                  <>
                                    <EyeOff className="w-4 h-4 mr-2" />
                                    Hide from team
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-4 h-4 mr-2" />
                                    Show to team
                                  </>
                                )}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteLead(lead._id)}
                              className="text-red-500"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Lead Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Lead</DialogTitle>
            <DialogDescription>Update the lead details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={editLead.name}
                onChange={(e) =>
                  setEditLead({ ...editLead, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                value={editLead.email}
                onChange={(e) =>
                  setEditLead({ ...editLead, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input
                value={editLead.phone}
                onChange={(e) =>
                  setEditLead({ ...editLead, phone: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Source</label>
              <Input
                value={editLead.source}
                onChange={(e) =>
                  setEditLead({ ...editLead, source: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={editLead.status}
                onValueChange={(value) =>
                  setEditLead({ ...editLead, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveLead}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
