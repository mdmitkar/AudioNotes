import { Router, Response } from "express";
import Episode from "../models/Episode";
import CreatorProfile from "../models/CreatorProfile";
import { authenticate, AuthRequest } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { storageService } from "../services/StorageService";

const router = Router();

router.use(authenticate);
router.use(authorize("creator", "admin"));

// GET /api/creator/profile
router.get("/profile", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await CreatorProfile.findOne({ userId: req.user!._id }).populate("userId", "name email avatar").populate("examIds", "name slug icon");
    res.json({ success: true, data: profile });
  } catch {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// PATCH /api/creator/profile
router.patch("/profile", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bio, expertise, examIds } = req.body;
    const profile = await CreatorProfile.findOneAndUpdate(
      { userId: req.user!._id },
      { bio, expertise, examIds },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: profile });
  } catch {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// GET /api/creator/episodes
router.get("/episodes", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const episodes = await Episode.find({ creatorId: req.user!._id })
      .populate("examId", "name slug icon color")
      .populate("subjectId", "name slug")
      .populate("topicId", "name slug")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: episodes });
  } catch {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// GET /api/creator/analytics
router.get("/analytics", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const episodes = await Episode.find({ creatorId: req.user!._id });
    const totalEpisodes = episodes.length;
    const publishedEpisodes = episodes.filter(e => e.status === "published").length;
    const totalPlays = episodes.reduce((acc, e) => acc + e.playCount, 0);
    const pendingEpisodes = episodes.filter(e => e.status === "pending").length;
    res.json({
      success: true,
      data: { totalEpisodes, publishedEpisodes, pendingEpisodes, totalPlays },
    });
  } catch {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// POST /api/creator/episodes - upload new episode
const audioUploader = storageService.getUploader("audio", "audio", /audio\/(mpeg|mp3|wav|ogg|mp4|webm|aac)/);
const thumbUploader = storageService.getUploader("thumbnail", "thumbnails", /image\/(jpeg|jpg|png|webp)/);

router.post(
  "/episodes",
  (req: any, res: any, next: any) => {
    audioUploader.fields([
      { name: "audio", maxCount: 1 },
      { name: "thumbnail", maxCount: 1 },
    ])(req, res, next);
  },
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const files = req.files as Record<string, Express.Multer.File[]>;
      const { title, description, examId, subjectId, topicId, duration, isPremium, whatYoullLearn, difficulty } = req.body;

      if (!title || !examId || !subjectId || !topicId) {
        res.status(400).json({ success: false, error: "Missing required fields" });
        return;
      }

      let audioUrl: string | null = null;
      let thumbnailUrl: string | null = null;

      if (files?.audio?.[0]) {
        audioUrl = await storageService.upload(files.audio[0], "audio");
      }
      if (files?.thumbnail?.[0]) {
        thumbnailUrl = await storageService.upload(files.thumbnail[0], "thumbnails");
      }

      const learnItems = whatYoullLearn
        ? Array.isArray(whatYoullLearn) ? whatYoullLearn : [whatYoullLearn]
        : [];

      const episode = await Episode.create({
        title,
        description,
        audioUrl,
        thumbnailUrl,
        creatorId: req.user!._id,
        examId,
        subjectId,
        topicId,
        duration: parseInt(duration) || 0,
        isPremium: isPremium === "true" || isPremium === true,
        status: "pending",
        whatYoullLearn: learnItems,
        difficulty: difficulty || "intermediate",
      });

      res.status(201).json({ success: true, data: episode });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: "Server error" });
    }
  }
);

// PATCH /api/creator/episodes/:id - update draft
router.patch("/episodes/:id", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const episode = await Episode.findOne({ _id: req.params.id, creatorId: req.user!._id });
    if (!episode) {
      res.status(404).json({ success: false, error: "Episode not found" });
      return;
    }
    if (episode.status === "published") {
      res.status(400).json({ success: false, error: "Cannot edit published episodes" });
      return;
    }
    const { title, description, duration, isPremium, whatYoullLearn } = req.body;
    Object.assign(episode, { title, description, duration, isPremium, whatYoullLearn });
    await episode.save();
    res.json({ success: true, data: episode });
  } catch {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// DELETE /api/creator/episodes/:id - delete draft
router.delete("/episodes/:id", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const episode = await Episode.findOne({ _id: req.params.id, creatorId: req.user!._id });
    if (!episode) {
      res.status(404).json({ success: false, error: "Episode not found" });
      return;
    }
    if (episode.status === "published") {
      res.status(400).json({ success: false, error: "Cannot delete published episodes. Unpublish first." });
      return;
    }
    await episode.deleteOne();
    res.json({ success: true, message: "Episode deleted" });
  } catch {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

export default router;
