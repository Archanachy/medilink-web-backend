import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { PatientController } from "../controllers/patient.controller";
import { requireAuth, requireRole } from "../middleware/auth.middleware";

const router = Router();
const controller = new PatientController();

const uploadDir = path.join(process.cwd(), "uploads", "profile-images");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname) || "";
        const patientId = req.params?.id; // deterministic name per patient
        const filename = patientId ? `${patientId}-profileImage${ext}` : `${Date.now()}-${file.fieldname}${ext}`;
        cb(null, filename);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith("image/")) return cb(null, true);
        cb(new Error("Only image uploads are allowed"));
    },
});

router.post("/", requireAuth, requireRole("patient", "admin"), controller.create);
router.get("/user/:userId", requireAuth, requireRole("patient", "admin"), controller.getByUserId);
router.get("/:id", requireAuth, requireRole("patient", "admin"), controller.getById);
router.put("/:id", requireAuth, requireRole("patient", "admin"), upload.single("profileImage"), controller.update);
router.delete("/:id", requireAuth, requireRole("patient", "admin"), controller.remove);

export default router;