/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Kanban, Target, TrendingUp } from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";

interface Lead {
  status?: string;
}

interface DashboardStats {
  totalLeads: number;
  totalPipelines: number;
  totalMembers: number;
  convertedLeads: number;
}

export default function DashboardPage() {
  const router = useRouter();

  const {
    currentWorkspace,
    currentMembership,
    memberships,
    createWorkspace,
    isLoading: wsLoading,
  } = useWorkspace();

  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    totalPipelines: 0,
    totalMembers: 0,
    convertedLeads: 0,
  });

  const [statsLoading, setStatsLoading] = useState(true);

  // -------------------------
  // Fetch workspace stats
  // -------------------------
  useEffect(() => {
    if (!currentWorkspace) return;

    const fetchStats = async () => {
      try {
        const [leadsRes, pipelinesRes] = await Promise.all([
          api.get<{ leads: Lead[] }>(
            `/lead/workspace/${currentWorkspace._id}`
          ),
          api.get<{ pipelines: any[] }>(
            `/pipeline/workspace/${currentWorkspace._id}`
          ),
        ]);

        const leads = leadsRes.data.leads ?? [];
        const pipelines = pipelinesRes.data.pipelines ?? [];

        setStats({
          totalLeads: leads.length,
          totalPipelines: pipelines.length,
          totalMembers: memberships.length,
          convertedLeads: leads.filter(
            (lead) => lead.status === "converted"
          ).length,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [currentWorkspace, memberships]);

  // -------------------------
  // Workspace loading state
  // -------------------------
  if (wsLoading || !currentWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        {wsLoading ? (
          <>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Loading workspace...</p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-4">
              Welcome to Realty Genie!
            </h2>

            <p className="text-muted-foreground mb-4">
              Create your first workspace to get started
            </p>

            <Button
              onClick={async () => {
                const name = prompt("Enter workspace name:");
                if (name) await createWorkspace(name);
              }}
            >
              Create Workspace
            </Button>
          </>
        )}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Leads",
      value: stats.totalLeads,
      icon: Users,
      href: "/leads",
      color: "text-blue-500",
    },
    {
      title: "Pipelines",
      value: stats.totalPipelines,
      icon: Kanban,
      href: "/pipeline",
      color: "text-purple-500",
    },
    {
      title: "Team Members",
      value: stats.totalMembers,
      icon: TrendingUp,
      href: "/team",
      color: "text-green-500",
    },
    {
      title: "Converted",
      value: stats.convertedLeads,
      icon: Target,
      href: "/leads",
      color: "text-orange-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Welcome back!</h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening in {currentWorkspace.name}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>

                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </CardHeader>

              <CardContent>
                <div className="text-3xl font-bold">
                  {statsLoading ? "..." : stat.value}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Actions + Workspace Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>

          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2">

              <Button
                variant="outline"
                onClick={() => router.push("/pipeline")}
              >
                <Kanban className="w-4 h-4 mr-2" />
                View Pipelines
              </Button>

              <Button
                variant="outline"
                onClick={() => router.push("/leads")}
              >
                <Users className="w-4 h-4 mr-2" />
                Manage Leads
              </Button>

              <Button
                variant="outline"
                onClick={() => router.push("/campaigns")}
              >
                <Target className="w-4 h-4 mr-2" />
                Campaigns
              </Button>

              {currentMembership?.role === "OWNER" && (
                <Button
                  variant="outline"
                  onClick={() => router.push("/team")}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Manage Team
                </Button>
              )}

            </div>
          </CardContent>
        </Card>

        {/* Workspace Info */}
        <Card>
          <CardHeader>
            <CardTitle>Workspace Info</CardTitle>
          </CardHeader>

          <CardContent className="space-y-2">

            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{currentWorkspace.name}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Type:</span>
              <span className="font-medium">{currentWorkspace.type}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Your Role:</span>

              <span className="font-medium">
                {currentMembership ? currentMembership.role : "Loading..."}
                {console.log(currentMembership)}
              </span>

            </div>

          </CardContent>
        </Card>

      </div>
    </div>
  );
}