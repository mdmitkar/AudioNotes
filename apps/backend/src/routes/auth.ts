import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User';
import CreatorProfile from '../models/CreatorProfile';
import { authenticate, AuthRequest } from '../middleware/authenticate';

const router = Router();

const generateTokens = (userId: string) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as any }
  );
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET || 'refresh_secret',
    { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any }
  );
  return { accessToken, refreshToken };
};

// POST /api/auth/register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['student', 'creator']).withMessage('Invalid role'),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const { name, email, password, role = 'student' } = req.body;
    try {
      const existing = await User.findOne({ email });
      if (existing) {
        res.status(409).json({ success: false, error: 'Email already registered' });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await User.create({ name, email, passwordHash, role });

      if (role === 'creator') {
        await CreatorProfile.create({ userId: user._id });
      }

      const tokens = generateTokens(user._id.toString());
      res.status(201).json({
        success: true,
        data: {
          user: { _id: user._id, name: user.name, email: user.email, role: user.role },
          ...tokens,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        res.status(401).json({ success: false, error: 'Invalid credentials' });
        return;
      }
      const valid = await user.comparePassword(password);
      if (!valid) {
        res.status(401).json({ success: false, error: 'Invalid credentials' });
        return;
      }
      if (!user.isActive) {
        res.status(403).json({ success: false, error: 'Account disabled' });
        return;
      }

      const tokens = generateTokens(user._id.toString());
      res.json({
        success: true,
        data: {
          user: { _id: user._id, name: user.name, email: user.email, role: user.role, selectedExams: user.selectedExams },
          ...tokens,
        },
      });
    } catch {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
);

// POST /api/auth/refresh
router.post('/refresh', async (req: AuthRequest, res: Response): Promise<void> => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(400).json({ success: false, error: 'Refresh token required' });
    return;
  }
  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'refresh_secret'
    ) as { userId: string };
    const tokens = generateTokens(decoded.userId);
    res.json({ success: true, data: tokens });
  } catch {
    res.status(401).json({ success: false, error: 'Invalid refresh token' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id)
      .select('-passwordHash')
      .populate('selectedExams');
    res.json({ success: true, data: user });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// PATCH /api/auth/selected-exams
router.patch('/selected-exams', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user!._id,
      { selectedExams: req.body.examIds },
      { new: true }
    ).select('-passwordHash');
    res.json({ success: true, data: user });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;
