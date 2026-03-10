import { Router } from "express";
import { AppointmentController } from "../controllers/appointment.controller";
import { requireAuth, requireRole } from "../middleware/auth.middleware";

const router = Router();
const controller = new AppointmentController();

// Public routes
router.get("/", requireAuth, requireRole("admin"), controller.list);
router.get("/patient/:patientId", requireAuth, requireRole("patient", "admin"), controller.getByPatient);
router.get("/doctor/:doctorId", requireAuth, requireRole("doctor", "admin"), controller.getByDoctor);
router.get("/available-slots", controller.getAvailableSlots);
router.get("/:id", requireAuth, requireRole("patient", "doctor", "admin"), controller.getById);

// Protected routes would go here later
router.post("/", requireAuth, requireRole("patient", "admin"), controller.create);
router.put("/:id", requireAuth, requireRole("patient", "doctor", "admin"), controller.update);
router.patch("/:id/cancel", requireAuth, requireRole("patient", "doctor", "admin"), controller.cancel);
router.delete("/:id", requireAuth, requireRole("admin"), controller.remove);

export default router;
