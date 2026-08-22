import { Router, Response } from 'express';
import Subject from '../models/Subject';
import Topic from '../models/Topic';
import { AuthRequest } from '../middleware/authenticate';

const router = Router();

// GET /api/subjects/:id
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const subject = await Subject.findById(req.params.id).populate('examId');
    if (!subject) { res.status(404).json({ success: false, error: 'Subject not found' }); return; }
    res.json({ success: true, data: subject });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/subjects/:id/topics
router.get('/:id/topics', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const topics = await Topic.find({ subjectId: req.params.id }).sort({ order: 1, name: 1 });
    res.json({ success: true, data: topics });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;
