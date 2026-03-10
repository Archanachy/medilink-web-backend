import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { DoctorController } from "../controllers/doctor.controller";
import { requireAuth, requireRole } from "../middleware/auth.middleware";

const router = Router();
const controller = new DoctorController();

const uploadDir = path.join(process.cwd(), "uploads", "profile-images");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname) || "";
        const doctorId = req.params?.id;
        const filename = doctorId ? `${doctorId}-profileImage${ext}` : `${Date.now()}-${file.fieldname}${ext}`;
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

// Public routes
router.get("/", controller.list);
router.get("/specialization", controller.getBySpecialization);
router.get("/:id", controller.getById);
router.get("/:id/availability", controller.getAvailability);

// Protected routes would go here later
router.post("/", requireAuth, requireRole("doctor", "admin"), upload.single("profileImage"), controller.create);
router.put("/:id", requireAuth, requireRole("doctor", "admin"), upload.single("profileImage"), controller.update);
router.put("/:id/availability", requireAuth, requireRole("doctor", "admin"), controller.updateAvailability);
router.delete("/:id", requireAuth, requireRole("doctor", "admin"), controller.remove);

export default router;
