import dotenv from "dotenv";
dotenv.config();

export const env = {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: Number(process.env.PORT) || 5000,

    // Database
    MONGO_URI: process.env.MONGO_URI!,

    // JWT
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,

    // Google OAuth
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
    GOOGLE_REDIRECT_URI:
        process.env.GOOGLE_REDIRECT_URI ||
        "http://localhost:5000/auth/google/callback",

    // App
    APP_URL: process.env.APP_URL || `http://localhost:${process.env.PORT || 5000}`,

    get isProduction() {
        return this.NODE_ENV === "production";
    },
};
