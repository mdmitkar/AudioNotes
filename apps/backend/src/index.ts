import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./config/database";
import authRoutes from "./routes/auth";
import examRoutes from "./routes/exams";
import subjectRoutes from "./routes/subjects";
import topicRoutes from "./routes/topics";
import episodeRoutes from "./routes/episodes";
import progressRoutes from "./routes/progress";
import bookmarkRoutes from "./routes/bookmarks";
import creatorRoutes from "./routes/creator";
import adminRoutes from "./routes/admin";
import userRoutes from "./routes/users";
import subscriptionRoutes from "./routes/subscriptions";

const app = express();
const PORT = process.env.PORT || 4000;

connectDB();

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: "*", methods: ["GET","POST","PUT","PATCH","DELETE"], allowedHeaders: ["Content-Type","Authorization"] }));
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const uploadsDir = path.resolve(process.env.UPLOADS_DIR || "./uploads");
app.use("/uploads", express.static(uploadsDir));

app.get("/health", (_, res) => { res.json({ status: "ok", timestamp: new Date().toISOString() }); });

app.use("/api/auth", authRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/episodes", episodeRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/creator", creatorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/subscriptions", subscriptionRoutes);

app.use((_, res) => { res.status(404).json({ success: false, error: "Route not found" }); });

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: "Internal server error" });
});

app.listen(PORT, () => { console.log("ReviseCast Backend running on http://localhost:" + PORT); });

export default app;