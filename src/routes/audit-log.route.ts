import { Router } from "express";
import { AuditLogController } from "../controllers/audit-log.controller";
import { requireAdmin } from "../middleware/admin.middleware";

const router = Router();
const controller = new AuditLogController();

router.use("/admin/audit-logs", requireAdmin);

router.get("/admin/audit-logs", controller.list);
router.get("/admin/audit-logs/user/:userId", controller.listByUser);
router.get("/admin/audit-logs/export", controller.export);

export default router;
