import { Router, Response } from "express";
import ListeningProgress from "../models/ListeningProgress";
import Episode from "../models/Episode";
import { authenticate, AuthRequest } from "../middleware/authenticate";

const router = Router();

const populateProgress = (q: any) =>
  q.populate({
    path: "episodeId",
    populate: [
      { path: "creatorId", select: "name avatar" },
      { path: "examId", select: "name slug icon color" },
      { path: "subjectId", select: "name slug" },
      { path: "topicId", select: "name slug" },
    ],
  });

// GET /api/progress - get all progress for user
router.get("/", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const progress = await populateProgress(ListeningProgress.find({ userId: req.user!._id })).sort({ lastPlayedAt: -1 });
    res.json({ success: true, data: progress });
  } catch {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// GET /api/progress/in-progress - episodes not completed
router.get("/in-progress", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const progress = await populateProgress(
      ListeningProgress.find({
        userId: req.user!._id,
        completed: false,
        progressSeconds: { "$gt": 0 },
      })
    ).sort({ lastPlayedAt: -1 }).limit(10);
    const valid = progress.filter((p: any) => p.episodeId !== null);
    res.json({ success: true, data: valid });
  } catch {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// GET /api/progress/:episodeId
router.get("/:episodeId", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const progress = await ListeningProgress.findOne({
      userId: req.user!._id,
      episodeId: req.params.episodeId,
    });
    res.json({ success: true, data: progress });
  } catch {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// POST /api/progress/:episodeId
router.post("/:episodeId", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { progressSeconds, completed } = req.body;
  try {
    const episode = await Episode.findById(req.params.episodeId);
    if (!episode) {
      res.status(404).json({ success: false, error: "Episode not found" });
      return;
    }
    const autoCompleted = completed || (episode.duration > 0 && progressSeconds >= episode.duration * 0.9);
    const progress = await ListeningProgress.findOneAndUpdate(
      { userId: req.user!._id, episodeId: req.params.episodeId },
      { progressSeconds, completed: autoCompleted, lastPlayedAt: new Date() },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: progress });
  } catch {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

export default router;
