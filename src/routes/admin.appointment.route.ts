import { Router } from "express";
import { AdminAppointmentController } from "../controllers/admin.appointment.controller";
import { requireAdmin } from "../middleware/admin.middleware";

const router = Router();
const controller = new AdminAppointmentController();

router.use(requireAdmin);

router.get("/", controller.list);
router.get("/stats", controller.stats);
router.get("/:id", controller.getById);
router.put("/:id/cancel", controller.cancel);

export default router;
