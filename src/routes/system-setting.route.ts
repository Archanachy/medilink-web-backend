import { Router } from "express";
import { AdminSettingsController } from "../controllers/admin-settings.controller";
import { requireAdmin } from "../middleware/admin.middleware";

const router = Router();
const controller = new AdminSettingsController();

router.use("/admin/settings", requireAdmin);

router.get("/admin/settings", controller.list);
router.get("/admin/settings/:key", controller.getByKey);
router.put("/admin/settings/:key", controller.update);

export default router;
