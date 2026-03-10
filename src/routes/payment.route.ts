import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";
import { requireAuth, requireRole } from "../middleware/auth.middleware";

const router = Router();
const controller = new PaymentController();

router.post("/patient/payments/create-intent", requireAuth, requireRole("patient", "admin"), controller.createIntent);
router.post("/patient/payments/confirm", requireAuth, requireRole("patient", "admin"), controller.confirm);
router.get("/patient/payments", requireAuth, requireRole("patient", "admin"), controller.listForPatient);
router.get("/patient/payments/:id", requireAuth, requireRole("patient", "admin"), controller.getById);

router.get("/doctor/revenue", requireAuth, requireRole("doctor", "admin"), controller.getDoctorRevenue);

router.post("/payments/webhook/stripe", controller.webhook);
router.post("/payments/webhook/razorpay", controller.webhook);

router.post("/doctor/payments/:id/refund", requireAuth, requireRole("doctor", "admin"), controller.refund);

export default router;
