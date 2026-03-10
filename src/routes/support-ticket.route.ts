import { Router } from "express";
import { PatientSupportController } from "../controllers/patient-support.controller";
import { AdminSupportController } from "../controllers/admin-support.controller";
import { requireAuth, requireRole } from "../middleware/auth.middleware";
import { requireAdmin } from "../middleware/admin.middleware";

const router = Router();
const patientController = new PatientSupportController();
const adminController = new AdminSupportController();

router.post("/support/tickets", requireAuth, requireRole("patient", "doctor", "admin"), patientController.create);
router.get("/support/tickets", requireAuth, requireRole("patient", "doctor", "admin"), patientController.list);
router.get("/support/tickets/:id", requireAuth, requireRole("patient", "doctor", "admin"), patientController.getById);
router.post("/support/tickets/:id/responses", requireAuth, requireRole("patient", "doctor", "admin"), patientController.addResponse);
router.put("/support/tickets/:id/close", requireAuth, requireRole("patient", "doctor", "admin"), patientController.close);

router.get("/admin/support/tickets", requireAdmin, adminController.list);
router.get("/admin/support/tickets/stats", requireAdmin, adminController.stats);
router.put("/admin/support/tickets/:id/assign", requireAdmin, adminController.assign);
router.put("/admin/support/tickets/:id/status", requireAdmin, adminController.updateStatus);
router.post("/admin/support/tickets/:id/responses", requireAdmin, adminController.addResponse);

export default router;
