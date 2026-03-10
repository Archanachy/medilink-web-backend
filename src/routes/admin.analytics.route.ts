import { Router } from "express";
import { AdminAnalyticsAdvancedController } from "../controllers/admin-analytics-advanced.controller";
import { requireAdmin } from "../middleware/admin.middleware";

const router = Router();
const controller = new AdminAnalyticsAdvancedController();

router.use(requireAdmin);

router.get("/overview", controller.overview);
router.get("/users", controller.users);
router.get("/revenue", controller.revenue);
router.get("/appointments", controller.appointments);
router.get("/doctors", controller.doctors);
router.get("/geolocation", controller.geolocation);
router.get("/export", controller.export);

export default router;
