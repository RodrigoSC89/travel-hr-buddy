import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import crewRoutes from "./routes/crew";
import vesselRoutes from "./routes/vessels";
import missionRoutes from "./routes/missions";
import aiRoutes from "./routes/ai";
import { ok } from "./types";

const app = express();
const PORT = process.env.PORT ?? 3001;

// Security
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? "*",
    credentials: true,
  })
);

// Rate limiting
app.use(
  rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
    max: Number(process.env.RATE_LIMIT_MAX) || 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Parsing & logging
app.use(express.json({ limit: "10mb" }));
app.use(morgan("combined"));

// Health check (no auth required)
app.get("/health", (_req, res) => {
  res.json(ok({ status: "ok", version: "1.0.0", uptime: process.uptime() }));
});

// Routes
app.use("/api/crew", crewRoutes);
app.use("/api/vessels", vesselRoutes);
app.use("/api/missions", missionRoutes);
app.use("/api/ai", aiRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Route not found", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Nautilus Backend running on port ${PORT}`);
});

export default app;
