import express from "express";
import {
  createLead,
  getLeads,
  updateLead,
  deleteLead,
  getLeadDetails,
  addLeads,
  getLeadsByCampaing,
  assignCampaingToLeads,
  getLeadsForKanban,
  toggleLeadVisibility,
} from "./lead.controller";
const router = express.Router();
import requireAuth from "../../shared/middleware/requireAuth";

router.get("/health", (req, res) => {
  res.send("Lead Route running properly");
});

router.use(requireAuth);

router.post("/create", createLead);
router.post("/addLeads", addLeads);
router.get("/workspace/:workspaceId", getLeads);
router.get("/details/:id", getLeadDetails);
router.put("/details/:id", updateLead);
router.delete("/details/:id", deleteLead);
router.get("/campaign/:campaignId/workspace/:workspaceId", getLeadsByCampaing);
router.post("/assignCampaingToLeads", assignCampaingToLeads);
// Kanban board endpoint - returns leads with visibility rules applied
router.get("/kanban/:workspaceId", getLeadsForKanban);
// Toggle lead visibility - AGENTs can hide/show their leads from other agents
router.patch("/visibility/:id", toggleLeadVisibility);

export default router;
