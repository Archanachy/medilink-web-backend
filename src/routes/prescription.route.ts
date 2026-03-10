import { Router } from "express";
import { PrescriptionController } from "../controllers/prescription.controller";
import { requireAuth, requireRole } from "../middleware/auth.middleware";

const router = Router();
const controller = new PrescriptionController();

router.post("/doctor/prescriptions", requireAuth, requireRole("doctor", "admin"), controller.create);
router.get("/doctor/prescriptions", requireAuth, requireRole("doctor", "admin"), controller.listByDoctor);
router.get("/doctor/prescriptions/:id", requireAuth, requireRole("doctor", "admin"), controller.getById);
router.put("/doctor/prescriptions/:id", requireAuth, requireRole("doctor", "admin"), controller.update);
router.put("/doctor/prescriptions/:id/items", requireAuth, requireRole("doctor", "admin"), controller.updateItems);

router.get("/patient/prescriptions", requireAuth, requireRole("patient", "admin"), controller.listByPatient);
router.get("/patient/prescriptions/:id", requireAuth, requireRole("patient", "admin"), controller.getById);
router.get("/patient/prescriptions/:id/download", requireAuth, requireRole("patient", "admin"), controller.download);

export default router;
