import express from 'express'
import cookieParser from "cookie-parser";
import authModule from './modules/auth/auth.module'
import userModule from './modules/user/user.module'
import workspaceModule from './modules/workspace/workspace.module'
import membershipModule from './modules/memberships/memberships.module'

const app = express();

// ── Global Middleware ─────────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());

// ── Health Check ──────────────────────────────────────────────────────
app.get("/api/v1/health", (_req, res) => {
    res.status(200).json({ status: "healthy" });
});

// ── Module Routes ─────────────────────────────────────────────────────
app.use("/api/v1/auth", authModule);
app.use("/api/v1/user", userModule);
app.use("/api/v1/workspace", workspaceModule);
app.use("/api/v1/memberships", membershipModule);

export default app;
