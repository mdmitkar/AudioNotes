import { Router, Response } from "express";
import Episode from "../models/Episode";
import User from "../models/User";
import Exam from "../models/Exam";
import Subject from "../models/Subject";
import Topic from "../models/Topic";
import AdminAction from "../models/AdminAction";
import ListeningProgress from "../models/ListeningProgress";
import { authenticate, AuthRequest } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = Router();
router.use(authenticate);
router.use(authorize("admin"));

// GET /api/admin/stats
router.get("/stats", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [totalUsers, totalCreators, totalEpisodes, publishedEpisodes, pendingEpisodes, premiumEpisodes, totalProgress] = await Promise.all([
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: "creator", isActive: true }),
      Episode.countDocuments(),
      Episode.countDocuments({ status: "published" }),
      Episode.countDocuments({ status: "pending" }),
      Episode.countDocuments({ isPremium: true, status: "published" }),
      ListeningProgress.aggregate([{ "$group": { _id: null, totalSeconds: { "$sum": "$progressSeconds" } } }]),
    ]);
    const totalListeningMinutes = Math.round((totalProgress[0]?.totalSeconds || 0) / 60);
    res.json({
      success: true,
      data: { totalUsers, totalCreators, totalEpisodes, publishedEpisodes, pendingEpisodes, premiumEpisodes, totalListeningMinutes },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// GET /api/admin/pending - pending episodes
router.get("/pending", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const episodes = await Episode.find({ status: "pending" })
      .populate("creatorId", "name email avatar")
      .populate("examId", "name slug icon color")
      .populate("subjectId", "name slug")
      .populate("topicId", "name slug")
      .sort({ createdAt: 1 });
    res.json({ success: true, data: episodes });
  } catch {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// PATCH /api/admin/episodes/:id/approve
router.patch("/episodes/:id/approve", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { featured } = req.body;
    const update: any = { status: "published" };
    if (featured) update.featuredAt = new Date();
    const episode = await Episode.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!episode) { res.status(404).json({ success: false, error: "Episode not found" }); return; }
    await AdminAction.create({ adminId: req.user!._id, action: "approve_episode", targetType: "episode", targetId: episode._id, reason: "" });
    res.json({ success: true, data: episode });
  } catch {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// PATCH /api/admin/episodes/:id/reject
router.patch("/episodes/:id/reject", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { reason } = req.body;
    const episode = await Episode.findByIdAndUpdate(req.params.id, { status: "rejected", rejectionReason: reason || "Did not meet quality standards" }, { new: true });
    if (!episode) { res.status(404).json({ success: false, error: "Episode not found" }); return; }
    await AdminAction.create({ adminId: req.user!._id, action: "reject_episode", targetType: "episode", targetId: episode._id, reason: reason || "" });
    res.json({ success: true, data: episode });
  } catch {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// PATCH /api/admin/episodes/:id/feature
router.patch("/episodes/:id/feature", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const episode = await Episode.findByIdAndUpdate(req.params.id, { featuredAt: new Date() }, { new: true });
    res.json({ success: true, data: episode });
  } catch {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// GET /api/admin/episodes - all episodes with filters
router.get("/episodes", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, page = "1", limit = "20" } = req.query as Record<string, string>;
    const filter: any = {};
    if (status) filter.status = status;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const [episodes, total] = await Promise.all([
      Episode.find(filter)
        .populate("creatorId", "name email")
        .populate("examId", "name slug")
        .populate("subjectId", "name")
        .populate("topicId", "name")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Episode.countDocuments(filter),
    ]);
    res.json({ success: true, data: episodes, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) });
  } catch {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// GET /api/admin/users
router.get("/users", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, page = "1", limit = "20" } = req.query as Record<string, string>;
    const filter: any = {};
    if (role) filter.role = role;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(filter).select("-passwordHash").sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
      User.countDocuments(filter),
    ]);
    res.json({ success: true, data: users, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) });
  } catch {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// PATCH /api/admin/users/:id/toggle
router.patch("/users/:id/toggle", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) { res.status(404).json({ success: false, error: "User not found" }); return; }
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, data: { isActive: user.isActive } });
  } catch {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// Exam/Subject/Topic management
router.post("/exams", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const exam = await Exam.create(req.body);
    res.status(201).json({ success: true, data: exam });
  } catch {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

router.post("/subjects", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const subject = await Subject.create(req.body);
    res.status(201).json({ success: true, data: subject });
  } catch {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

router.post("/topics", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const topic = await Topic.create(req.body);
    res.status(201).json({ success: true, data: topic });
  } catch {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

export default router;
