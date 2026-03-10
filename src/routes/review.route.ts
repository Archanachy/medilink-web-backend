import { Router } from "express";
import { ReviewController } from "../controllers/review.controller";
import { requireAuth, requireRole } from "../middleware/auth.middleware";

const router = Router();
const controller = new ReviewController();

// Patient review endpoints
router.post("/patient/reviews", requireAuth, requireRole("patient", "admin"), controller.create);
router.put("/patient/reviews/:id", requireAuth, requireRole("patient", "admin"), controller.update);
router.delete("/patient/reviews/:id", requireAuth, requireRole("patient", "admin"), controller.remove);
router.get("/patient/reviews", requireAuth, requireRole("patient", "admin"), controller.listByPatient);

// Doctor review endpoints
router.get("/doctor/reviews", requireAuth, requireRole("doctor", "admin"), controller.listByDoctor);
router.get("/doctor/reviews/stats", requireAuth, requireRole("doctor", "admin"), controller.getDoctorStats);

export default router;
