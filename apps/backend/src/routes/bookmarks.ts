import { Router, Response } from "express";
import Bookmark from "../models/Bookmark";
import { authenticate, AuthRequest } from "../middleware/authenticate";

const router = Router();

const populateBookmark = (q: any) =>
  q.populate({
    path: "episodeId",
    populate: [
      { path: "creatorId", select: "name avatar" },
      { path: "examId", select: "name slug icon color" },
      { path: "subjectId", select: "name slug" },
      { path: "topicId", select: "name slug" },
    ],
  });

router.get("/", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookmarks = await populateBookmark(Bookmark.find({ userId: req.user!._id })).sort({ createdAt: -1 });
    res.json({ success: true, data: bookmarks });
  } catch {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

router.post("/:episodeId", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const existing = await Bookmark.findOne({ userId: req.user!._id, episodeId: req.params.episodeId });
    if (existing) {
      res.json({ success: true, data: existing, message: "Already bookmarked" });
      return;
    }
    const bookmark = await Bookmark.create({ userId: req.user!._id, episodeId: req.params.episodeId });
    res.status(201).json({ success: true, data: bookmark });
  } catch {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

router.delete("/:episodeId", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Bookmark.findOneAndDelete({ userId: req.user!._id, episodeId: req.params.episodeId });
    res.json({ success: true, message: "Bookmark removed" });
  } catch {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

router.get("/check/:episodeId", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookmark = await Bookmark.findOne({ userId: req.user!._id, episodeId: req.params.episodeId });
    res.json({ success: true, data: { isBookmarked: !!bookmark } });
  } catch {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

export default router;
