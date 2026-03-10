import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { AdminUserController } from "../controllers/admin.user.controller";
import { requireAdmin } from "../middleware/admin.middleware";

const router = Router();
const controller = new AdminUserController();

const uploadDir = path.join(process.cwd(), "uploads", "profile-images");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname) || "";
        const userId = req.params?.id;
        const filename = userId ? `${userId}-profileImage${ext}` : `${Date.now()}-${file.fieldname}${ext}`;
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

router.use(requireAdmin);

router.post("/", upload.single("profileImage"), controller.create);
router.get("/", controller.list);
router.get("/:id", controller.getById);
router.put("/:id/block", controller.block);
router.put("/:id/unblock", controller.unblock);
router.put("/:id", upload.single("profileImage"), controller.update);
router.delete("/:id", controller.remove);

export default router;
