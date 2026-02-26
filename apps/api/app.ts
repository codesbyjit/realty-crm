import express from 'express'
import cookieParser from "cookie-parser";
import authModule from "./modules/auth/auth.module";
import userModule from "./modules/user/user.module";

const app = express();

// ── Global Middleware ─────────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());

// ── Health Check ──────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
    res.status(200).json({ status: "healthy" });
});

// ── Module Routes ─────────────────────────────────────────────────────
app.use("/api/v1/auth", authModule);
app.use("/api/v1/user", userModule);

export default app;
