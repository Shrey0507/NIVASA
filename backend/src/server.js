import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

import healthRouter from "./routes/health.js";
import studentsRouter from "./routes/students.js";
import roomsRouter from "./routes/rooms.js";
import feesRouter from "./routes/fees.js";
import movementsRouter from "./routes/movements.js";
import grievancesRouter from "./routes/grievances.js";
import noticesRouter from "./routes/notices.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(
  cors({
    origin: [CLIENT_URL, "http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/health", healthRouter);
app.use("/api/students", studentsRouter);
app.use("/api/rooms", roomsRouter);
app.use("/api/fees", feesRouter);
app.use("/api/movements", movementsRouter);
app.use("/api/grievances", grievancesRouter);
app.use("/api/notices", noticesRouter);

app.get("/", (req, res) => {
  res.json({
    name: "NIVASA Smart Hostel Management API",
    status: "active",
    docs: "/api/health",
  });
});

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

app.listen(PORT, () => {
  console.log(`[NIVASA API] Server running on http://localhost:${PORT}`);
  console.log(`[NIVASA API] Health check: http://localhost:${PORT}/api/health`);
});
