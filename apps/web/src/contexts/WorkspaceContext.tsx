/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Workspace, Membership, User } from "@/lib/types";
import api from "@/lib/api";
import { useAuth } from "./AuthContext";

interface WorkspaceContextType {
  user: User | null;
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  memberships: Membership[];
  currentMembership: Membership | null;
  isLoading: boolean;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  createWorkspace: (name: string) => Promise<Workspace>;
  fetchWorkspaces: () => Promise<void>;
  fetchMemberships: (workspaceId: string) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined
);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(
    null
  );
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [currentMembership, setCurrentMembership] =
    useState<Membership | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // normalize workspace id
  const normalizeWorkspace = (ws: Workspace | any): Workspace => {
    const id = ws._id || ws.id;

    if (!id) {
      console.error("Workspace missing id:", ws);
    }

    return {
      ...ws,
      _id: String(id),
    };
  };

  // -------------------------
  // Fetch workspaces
  // -------------------------
  const fetchWorkspaces = async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      const { data } = await api.get<{ memberships: Membership[] }>(
        "/memberships/me"
      );

      const userMemberships = data.memberships || [];

      const userWorkspaces: Workspace[] = userMemberships
        .filter((m) => !m.isRemoved)
        .map((m) => {
          if (typeof m.workspace === "object") {
            return normalizeWorkspace(m.workspace as Workspace);
          }

          const wsId = String(m.workspace);

          return {
            _id: wsId,
            name: "Workspace",
            type: "TEAM",
          } as Workspace;
        });

      setWorkspaces(userWorkspaces);

      if (userWorkspaces.length > 0 && !currentWorkspace) {
        setCurrentWorkspace(userWorkspaces[0]);
      }
    } catch (error) {
      console.error("Failed to fetch workspaces:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------
  // Fetch memberships
  // -------------------------
  const fetchMemberships = async (workspaceId: string) => {
    try {
      const { data } = await api.get<Membership[]>(
        `/memberships/workspace/${workspaceId}`
      );

      const members = data || [];
      setMemberships(members);

      const currentUserMembership = members.find((m) => {
        if (!m.user || !user) return false;

        const memberUserId =
          typeof m.user === "object" ? m.user._id : m.user;

        return String(memberUserId) === String(user._id);
      });

      setCurrentMembership(currentUserMembership ?? null);
    } catch (error) {
      console.error("Failed to fetch memberships:", error);
    }
  };

  // -------------------------
  // Create workspace
  // -------------------------
  const createWorkspace = async (name: string) => {
    const { data } = await api.post<{ workspace: Workspace }>(
      "/workspace/create",
      { name }
    );

    const newWorkspace = data.workspace;

    const workspaceWithId: Workspace = {
      ...newWorkspace,
      _id: String(newWorkspace._id || newWorkspace.id || ""),
    };

    setWorkspaces((prev) => [...prev, workspaceWithId]);
    setCurrentWorkspace(workspaceWithId);

    return workspaceWithId;
  };

  // -------------------------
  // Effects
  // -------------------------
  useEffect(() => {
    if (user) {
      fetchWorkspaces();
    }
  }, [user]);

  useEffect(() => {
    if (currentWorkspace) {
      fetchMemberships(currentWorkspace._id);
    }
  }, [currentWorkspace]);

  // -------------------------
  // Provider
  // -------------------------
  return (
    <WorkspaceContext.Provider
      value={{
        user,
        workspaces,
        currentWorkspace,
        memberships,
        currentMembership,
        isLoading,
        setCurrentWorkspace,
        createWorkspace,
        fetchWorkspaces,
        fetchMemberships,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

// -------------------------
// Hook
// -------------------------
export function useWorkspace() {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  }

  return context;
}