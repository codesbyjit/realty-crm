import { Router } from "express";
import requireAuth from "../../shared/middleware/requireAuth";
import requireRole from "../../shared/middleware/requireRole";
import { getMe, getAllUsers } from "./user.controller";

const router = Router();

// GET /user/me — current user profile
router.get("/me", requireAuth, getMe);

// GET /user/admin/users — admin-only: list all users
router.get("/admin/users", requireAuth, requireRole("ADMIN"), getAllUsers);

export default router;
