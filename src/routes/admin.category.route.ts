import { Router } from "express";
import { AdminCategoryController } from "../controllers/admin.category.controller";
import { requireAdmin } from "../middleware/admin.middleware";

const router = Router();
const controller = new AdminCategoryController();

router.use(requireAdmin);

router.get("/", controller.list);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

export default router;
