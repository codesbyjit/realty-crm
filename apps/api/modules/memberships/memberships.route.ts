import { Router } from "express";
import requireAuth from "../../shared/middleware/requireAuth";
import {
  addMembers,
  getMembers,
  getMember,
  updateMember,
  removeMember,
  getMyMemberships,
} from "./memberships.controller";

const router = Router();

router.get("/me", requireAuth, getMyMemberships);
router.post("/add-members", requireAuth, addMembers);
router.get("/workspace/:workspaceId", requireAuth, getMembers);
router.get("/:id", requireAuth, getMember);
router.patch("/:id", requireAuth, updateMember);
router.delete("/:id", requireAuth, removeMember);

export default router;
