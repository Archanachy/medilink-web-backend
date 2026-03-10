import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();
const controller = new NotificationController();

router.get("/notifications", requireAuth, controller.listForCurrentUser);
router.patch("/notifications/:id/read", requireAuth, controller.markRead);

export default router;
