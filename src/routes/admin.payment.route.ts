import { Router } from "express";
import { AdminPaymentController } from "../controllers/admin.payment.controller";
import { requireAdmin } from "../middleware/admin.middleware";

const router = Router();
const controller = new AdminPaymentController();

router.use(requireAdmin);

router.get("/", controller.list);
router.get("/stats", controller.stats);
router.get("/:id", controller.getById);
router.post("/:id/refund", controller.refund);

export default router;
