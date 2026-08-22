import { Router, Response } from 'express';
import Episode from '../models/Episode';
import Subscription from '../models/Subscription';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/authenticate';

const router = Router();

const populateEpisode = (query: any) =>
  query
    .populate('creatorId', 'name avatar')
    .populate('examId', 'name slug icon color')
    .populate('subjectId', 'name slug icon')
    .populate('topicId', 'name slug');

const sanitizeEpisode = (episode: any, isPremiumUser: boolean) => {
  const obj = episode.toObject ? episode.toObject() : { ...episode };
  if (obj.isPremium && !isPremiumUser) {
    obj.audioUrl = null;
  }
  return obj;
};

const checkPremium = async (userId?: string): Promise<boolean> => {
  if (!userId) return false;
  const sub = await Subscription.findOne({ userId, status: 'active' });
  return !!(sub && sub.expiresAt && sub.expiresAt > new Date());
};

// GET /api/episodes - browse/search with filters
router.get('/', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      q, examId, subjectId, topicId, isPremium,
      difficulty, sort = 'newest', page = '1', limit = '20',
      minDuration, maxDuration,
    } = req.query as Record<string, string>;

    const filter: Record<string, any> = { status: 'published' };
    if (q) filter.$text = { $search: q };
    if (examId) filter.examId = examId;
    if (subjectId) filter.subjectId = subjectId;
    if (topicId) filter.topicId = topicId;
    if (isPremium !== undefined) filter.isPremium = isPremium === 'true';
    if (difficulty) filter.difficulty = difficulty;
    if (minDuration || maxDuration) {
      filter.duration = {};
      if (minDuration) filter.duration.$gte = parseInt(minDuration);
      if (maxDuration) filter.duration.$lte = parseInt(maxDuration);
    }

    const sortMap: Record<string, object> = {
      newest: { createdAt: -1 },
      popular: { playCount: -1 },
      shortest: { duration: 1 },
      longest: { duration: -1 },
    };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const [episodes, total] = await Promise.all([
      populateEpisode(Episode.find(filter))
        .sort(sortMap[sort] || sortMap.newest)
        .skip(skip)
        .limit(limitNum),
      Episode.countDocuments(filter),
    ]);

    const isPremiumUser = await checkPremium(req.user?._id);
    const data = episodes.map((ep: any) => sanitizeEpisode(ep, isPremiumUser));

    res.json({
      success: true,
      data,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/episodes/featured - featured episodes
router.get('/featured', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const episodes = await populateEpisode(
      Episode.find({ status: 'published', featuredAt: { $ne: null } })
    ).sort({ featuredAt: -1 }).limit(10);
    const isPremiumUser = await checkPremium(req.user?._id);
    res.json({ success: true, data: episodes.map((ep: any) => sanitizeEpisode(ep, isPremiumUser)) });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/episodes/quick - short episodes (<=20 min)
router.get('/quick', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const episodes = await populateEpisode(
      Episode.find({ status: 'published', duration: { $lte: 1200 } })
    ).sort({ playCount: -1 }).limit(20);
    const isPremiumUser = await checkPremium(req.user?._id);
    res.json({ success: true, data: episodes.map((ep: any) => sanitizeEpisode(ep, isPremiumUser)) });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/episodes/popular - popular this week
router.get('/popular', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const episodes = await populateEpisode(
      Episode.find({ status: 'published', createdAt: { $gte: oneWeekAgo } })
    ).sort({ playCount: -1 }).limit(20);
    const fallback = episodes.length < 5
      ? await populateEpisode(Episode.find({ status: 'published' })).sort({ playCount: -1 }).limit(20)
      : episodes;
    const isPremiumUser = await checkPremium(req.user?._id);
    res.json({ success: true, data: (episodes.length < 5 ? fallback : episodes).map((ep: any) => sanitizeEpisode(ep, isPremiumUser)) });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/episodes/:id
router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const episode = await populateEpisode(Episode.findById(req.params.id));
    if (!episode || episode.status !== 'published') {
      res.status(404).json({ success: false, error: 'Episode not found' });
      return;
    }
    const isPremiumUser = await checkPremium(req.user?._id);
    res.json({ success: true, data: sanitizeEpisode(episode, isPremiumUser) });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /api/episodes/:id/play - increment play count, return audio URL
router.post('/:id/play', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const episode = await Episode.findById(req.params.id);
    if (!episode || episode.status !== 'published') {
      res.status(404).json({ success: false, error: 'Episode not found' });
      return;
    }
    if (episode.isPremium) {
      const isPremiumUser = await checkPremium(req.user?._id);
      if (!isPremiumUser) {
        res.status(403).json({ success: false, error: 'premium_required', message: 'This episode requires a premium subscription' });
        return;
      }
    }
    await Episode.findByIdAndUpdate(episode._id, { $inc: { playCount: 1 } });
    res.json({ success: true, data: { audioUrl: episode.audioUrl } });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;
