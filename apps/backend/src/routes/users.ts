import { Router, Response } from "express";
import User from "../models/User";
import { authenticate, AuthRequest } from "../middleware/authenticate";

const router = Router();

// PATCH /api/users/profile
router.patch("/profile", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user!._id,
      { name, avatar },
      { new: true }
    ).select("-passwordHash");
    res.json({ success: true, data: user });
  } catch {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

export default router;
