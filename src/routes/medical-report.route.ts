import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { MedicalReportController } from "../controllers/medical-report.controller";
import { requireAuth, requireRole } from "../middleware/auth.middleware";

const router = Router();
const controller = new MedicalReportController();

const uploadDir = path.join(process.cwd(), "uploads", "medical-reports");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname) || "";
        const filename = `${Date.now()}-${file.fieldname}${ext}`;
        cb(null, filename);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const allowed = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
        if (allowed.includes(file.mimetype)) return cb(null, true);
        cb(new Error("Only PDF or image uploads are allowed"));
    },
});

router.post("/patient/reports", requireAuth, requireRole("patient", "admin"), upload.single("report"), controller.upload);
router.get("/patient/reports", requireAuth, requireRole("patient", "admin"), controller.listByPatient);
router.get("/patient/reports/:id", requireAuth, requireRole("patient", "admin"), controller.getById);
router.delete("/patient/reports/:id", requireAuth, requireRole("patient", "admin"), controller.delete);
router.put("/patient/reports/:id/share", requireAuth, requireRole("patient", "admin"), controller.share);

router.get("/doctor/patients/:patientId/reports", requireAuth, requireRole("doctor", "admin"), controller.listSharedWithDoctor);

export default router;
