import { Router, Response } from 'express';
import Exam from '../models/Exam';
import Subject from '../models/Subject';
import { AuthRequest } from '../middleware/authenticate';

const router = Router();

// GET /api/exams
router.get('/', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const exams = await Exam.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, data: exams });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/exams/:id
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) { res.status(404).json({ success: false, error: 'Exam not found' }); return; }
    res.json({ success: true, data: exam });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/exams/:id/subjects
router.get('/:id/subjects', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const subjects = await Subject.find({ examId: req.params.id }).sort({ order: 1, name: 1 });
    res.json({ success: true, data: subjects });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;
