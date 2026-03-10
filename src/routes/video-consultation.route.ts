import { Router } from "express";
import { PatientVideoController } from "../controllers/patient-video.controller";
import { DoctorVideoController } from "../controllers/doctor-video.controller";
import { requireAuth, requireRole } from "../middleware/auth.middleware";

const router = Router();
const patientController = new PatientVideoController();
const doctorController = new DoctorVideoController();

router.post("/patient/appointments/:id/start-video", requireAuth, requireRole("patient", "admin"), patientController.start);
router.get("/patient/video-consultations/:id", requireAuth, requireRole("patient", "admin"), patientController.getById);
router.post("/patient/video-consultations/:id/end", requireAuth, requireRole("patient", "admin"), patientController.end);

router.post("/doctor/appointments/:id/start-video", requireAuth, requireRole("doctor", "admin"), doctorController.start);
router.get("/doctor/video-consultations/:id", requireAuth, requireRole("doctor", "admin"), doctorController.getById);
router.post("/doctor/video-consultations/:id/end", requireAuth, requireRole("doctor", "admin"), doctorController.end);

export default router;
