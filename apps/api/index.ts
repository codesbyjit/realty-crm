import { env } from "./shared/config/env.config";
import { connectDB } from "./shared/config/db";
import app from "./app";

async function startServer() {
    await connectDB();

    app.listen(env.PORT, () => {
        console.log(
            `Server running on port ${env.PORT} [${env.NODE_ENV}]`,
        );
    });
}

startServer().catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
});