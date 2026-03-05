"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Membership, User } from "@/lib/types";
import api from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
  MoreVertical,
  UserPlus,
  Trash2,
  Shield,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";

export default function TeamPage() {
  const router = useRouter();
  const { currentWorkspace, currentMembership, memberships, fetchMemberships } =
    useWorkspace();
  const [isLoading, setIsLoading] = useState(true);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const isOwner = currentMembership?.role === "OWNER";

  useEffect(() => {
    if (!currentWorkspace) return;
    fetchMemberships(currentWorkspace._id);
    setIsLoading(false);
  }, [currentWorkspace]);

  const handleAddMember = async () => {
    if (!newMemberEmail.trim() || !currentWorkspace) {
      toast.error("Please enter an email address");
      return;
    }

    setIsAdding(true);
    try {
      await api.post("/memberships/add-members", {
        workspaceId: currentWorkspace._id,
        emails: [newMemberEmail],
      });

      setIsAddMemberOpen(false);
      setNewMemberEmail("");
      await fetchMemberships(currentWorkspace._id);
      toast.success("Invitation sent successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add member");
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveMember = async (membershipId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;

    try {
      await api.delete(`/memberships/${membershipId}`);
      if (currentWorkspace) {
        await fetchMemberships(currentWorkspace._id);
      }
      toast.success("Member removed successfully");
    } catch (error) {
      toast.error("Failed to remove member");
    }
  };

  const handleUpdateRole = async (
    membershipId: string,
    role: "OWNER" | "AGENT",
  ) => {
    try {
      await api.patch(`/memberships/${membershipId}`, { role });
      if (currentWorkspace) {
        await fetchMemberships(currentWorkspace._id);
      }
      toast.success(`Role updated to ${role}`);
    } catch (error) {
      toast.error("Failed to update role");
    }
  };

  const handleAcceptInvite = async (membershipId: string) => {
    try {
      await api.patch(`/memberships/${membershipId}`, { isAccepted: true });
      if (currentWorkspace) {
        await fetchMemberships(currentWorkspace._id);
      }
      toast.success("Invitation accepted");
    } catch (error) {
      toast.error("Failed to accept invitation");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!currentWorkspace) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-muted-foreground">Please select a workspace first</p>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <ShieldAlert className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">
          Only workspace owners can manage team members
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Members</h1>
          <p className="text-muted-foreground">Manage your workspace team</p>
        </div>

        <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Team Member</DialogTitle>
              <DialogDescription>
                Enter the email address of the person you want to invite
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="colleague@example.com"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddMemberOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddMember} disabled={isAdding}>
                {isAdding ? "Sending..." : "Send Invitation"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Members ({memberships.length})</CardTitle>
          <CardDescription>
            People who have access to this workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="h-10 w-10 bg-slate-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : memberships.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No team members yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {memberships
                  .filter((m) => !m.isRemoved)
                  .map((member) => {
                    const memberUser =
                      typeof member.user === "object" ? member.user : null;
                    const memberName = memberUser?.name || "Unknown User";
                    const memberEmail = memberUser?.email || "";

                    return (
                      <TableRow key={member._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {getInitials(memberName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{memberName}</p>
                              <p className="text-sm text-muted-foreground">
                                {memberEmail}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              member.role === "OWNER" ? "default" : "secondary"
                            }
                          >
                            {member.role === "OWNER" ? (
                              <>
                                <Shield className="w-3 h-3 mr-1" />
                                Owner
                              </>
                            ) : (
                              "Agent"
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {member.isAccepted ? (
                            <Badge variant="outline" className="text-green-500">
                              Active
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-yellow-500"
                            >
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(member.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {!member.isAccepted ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAcceptInvite(member._id)}
                            >
                              Accept Invite
                            </Button>
                          ) : member.role !== "OWNER" ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUpdateRole(member._id, "AGENT")
                                  }
                                >
                                  <Shield className="w-4 h-4 mr-2" />
                                  Set as Agent
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleRemoveMember(member._id)}
                                  className="text-red-500"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
