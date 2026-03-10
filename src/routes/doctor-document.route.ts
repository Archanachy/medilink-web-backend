import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { DoctorDocumentController } from "../controllers/doctor-document.controller";
import { requireAuth, requireRole } from "../middleware/auth.middleware";

const router = Router();
const controller = new DoctorDocumentController();

const uploadDir = path.join(process.cwd(), "uploads", "doctor-documents");
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

router.post("/doctor/documents", requireAuth, requireRole("doctor", "admin"), upload.single("document"), controller.upload);
router.get("/doctor/documents", requireAuth, requireRole("doctor", "admin"), controller.listByDoctor);
router.delete("/doctor/documents/:id", requireAuth, requireRole("doctor", "admin"), controller.remove);

router.put("/admin/doctor-documents/:id/status", requireAuth, requireRole("admin"), controller.updateStatus);

export default router;
