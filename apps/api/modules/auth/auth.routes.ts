import { Router } from "express";
import {
    register,
    login,
    refresh,
    logout,
    googleAuthStart,
    googleAuthCallback,
} from "./auth.controller";

const router = Router();

// Email + Password
router.post("/register", register);
router.post("/login", login);

// Token management
router.post("/refresh", refresh);
router.post("/logout", logout);

// Google OAuth
router.get("/google", googleAuthStart);
router.get("/google/callback", googleAuthCallback);

export default router;
