import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { AuthController } from "../controllers/user.controller";
import { requireAuth } from "../middleware/auth.middleware";

let authController = new AuthController();
const router = Router();

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

router.post("/register", authController.register)
router.post("/login", authController.login)
router.post("/forgot-password", authController.forgotPassword)
router.post("/reset-password", authController.resetPassword)
router.post("/change-password", requireAuth, authController.changePassword)
router.get("/users/:id", requireAuth, authController.getUserById)
router.put("/:id", requireAuth, upload.single("profileImage"), authController.updateUser)

export default router;