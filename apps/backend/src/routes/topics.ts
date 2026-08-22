import { Router, Response } from 'express';
import Topic from '../models/Topic';
import Episode from '../models/Episode';
import { AuthRequest } from '../middleware/authenticate';

const router = Router();

// GET /api/topics/:id
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const topic = await Topic.findById(req.params.id).populate({ path: 'subjectId', populate: { path: 'examId' } });
    if (!topic) { res.status(404).json({ success: false, error: 'Topic not found' }); return; }
    res.json({ success: true, data: topic });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/topics/:id/episodes
router.get('/:id/episodes', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const episodes = await Episode.find({ topicId: req.params.id, status: 'published' })
      .populate('creatorId', 'name avatar')
      .populate('examId', 'name slug icon color')
      .populate('subjectId', 'name slug')
      .populate('topicId', 'name slug')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: episodes });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;
