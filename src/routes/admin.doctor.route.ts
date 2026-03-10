import { Router } from "express";
import { AdminDoctorController } from "../controllers/admin.doctor.controller";
import { requireAdmin } from "../middleware/admin.middleware";

const router = Router();
const controller = new AdminDoctorController();

router.use(requireAdmin);

router.get("/", controller.list);
router.get("/pending", controller.listPending);
router.get("/:id", controller.getById);
router.get("/:id/documents", controller.listDocuments);
router.put("/:id/verify", controller.verify);
router.put("/:id/reject", controller.reject);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

export default router;
