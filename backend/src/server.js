import "dotenv/config";
import app from "./app.js";

const port = Number(process.env.PORT) || 5000;
const server = app.listen(port, () => console.log(JSON.stringify({ event: "server_started", port, environment: process.env.NODE_ENV || "development" })));
const shutdown = (signal) => { console.log(JSON.stringify({ event: "shutdown", signal })); server.close(() => process.exit(0)); setTimeout(() => process.exit(1), 10_000).unref(); };
process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
