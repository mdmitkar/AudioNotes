import { Router, Response } from "express";
import Subscription from "../models/Subscription";
import { authenticate, AuthRequest } from "../middleware/authenticate";

const router = Router();

// GET /api/subscriptions/my - get current user subscription
router.get("/my", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const subscription = await Subscription.findOne({ userId: req.user!._id, status: "active" });
    res.json({ success: true, data: subscription });
  } catch {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// POST /api/subscriptions/plans - list plans (placeholder)
router.get("/plans", async (_req: AuthRequest, res: Response): Promise<void> => {
  res.json({
    success: true,
    data: [
      { id: "premium_monthly", name: "Premium Monthly", price: 199, currency: "INR", interval: "month", features: ["Access all premium episodes", "Unlimited listening", "Offline downloads (coming soon)", "Priority support"] },
      { id: "premium_yearly", name: "Premium Yearly", price: 1499, currency: "INR", interval: "year", features: ["Everything in monthly", "Save 37%", "Early access to new features"] },
    ],
  });
});

// POST /api/subscriptions/checkout - placeholder for future payment integration
router.post("/checkout", authenticate, async (_req: AuthRequest, res: Response): Promise<void> => {
  res.json({
    success: false,
    error: "payment_not_configured",
    message: "Payment processing will be available soon. Check back later!",
  });
});

export default router;
