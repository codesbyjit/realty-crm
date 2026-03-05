"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useAuth } from "@/contexts/AuthContext";
import { Pipeline } from "@/lib/types";
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
import { Plus, Kanban, MoreVertical, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PipelinesPage() {
  const router = useRouter();
  const { currentWorkspace, user } = useWorkspace();
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newPipeline, setNewPipeline] = useState({
    name: "",
    type: "BUYER" as "BUYER" | "SELLER",
  });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!currentWorkspace) return;
    fetchPipelines();
  }, [currentWorkspace]);

  const fetchPipelines = async () => {
    if (!currentWorkspace) return;
    try {
      const response = await api.get(
        `/pipeline/workspace/${currentWorkspace._id}`,
      );
      setPipelines(response.data.pipelines || []);
    } catch (error) {
      console.error("Failed to fetch pipelines:", error);
      toast.error("Failed to load pipelines");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePipeline = async () => {
    if (!newPipeline.name.trim() || !currentWorkspace) {
      toast.error("Please enter a pipeline name");
      return;
    }

    setIsCreating(true);
    try {
      const response = await api.post("/pipeline/create", {
        name: newPipeline.name,
        type: newPipeline.type,
        workspaceId: currentWorkspace._id,
      });

      setPipelines((prev) => [...prev, response.data.pipeline]);
      setIsCreateOpen(false);
      setNewPipeline({ name: "", type: "BUYER" });
      toast.success("Pipeline created successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create pipeline");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeletePipeline = async (pipelineId: string) => {
    if (!confirm("Are you sure you want to delete this pipeline?")) return;

    try {
      await api.delete(`/pipeline/details/${pipelineId}`);
      setPipelines((prev) => prev.filter((p) => p._id !== pipelineId));
      toast.success("Pipeline deleted");
    } catch (error) {
      toast.error("Failed to delete pipeline");
    }
  };

  const handleOpenKanban = (pipelineId: string) => {
    router.push(`/dashboard/pipeline/${pipelineId}`);
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
          <h1 className="text-3xl font-bold">Pipelines</h1>
          <p className="text-muted-foreground">Manage your sales pipelines</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Pipeline
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Pipeline</DialogTitle>
              <DialogDescription>
                Create a new pipeline to organize your leads
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Pipeline Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Buyer Pipeline"
                  value={newPipeline.name}
                  onChange={(e) =>
                    setNewPipeline({ ...newPipeline, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Pipeline Type</Label>
                <Select
                  value={newPipeline.type}
                  onValueChange={(value: "BUYER" | "SELLER") =>
                    setNewPipeline({ ...newPipeline, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BUYER">Buyer</SelectItem>
                    <SelectItem value="SELLER">Seller</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePipeline} disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Pipeline"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pipeline Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-5 bg-slate-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : pipelines.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Kanban className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No pipelines yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first pipeline to get started
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Pipeline
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pipelines.map((pipeline) => (
            <Card
              key={pipeline._id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{pipeline.name}</CardTitle>
                  <CardDescription>
                    {pipeline.type === "BUYER"
                      ? "Buyer Pipeline"
                      : "Seller Pipeline"}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleOpenKanban(pipeline._id)}
                    >
                      <Kanban className="w-4 h-4 mr-2" />
                      Open Kanban
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeletePipeline(pipeline._id)}
                      className="text-red-500"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  onClick={() => handleOpenKanban(pipeline._id)}
                >
                  <Kanban className="w-4 h-4 mr-2" />
                  Open Kanban Board
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
