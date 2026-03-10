import { Router } from "express";
import { AdminContentController } from "../controllers/admin-content.controller";
import { ContentController } from "../controllers/content.controller";
import { requireAdmin } from "../middleware/admin.middleware";

const router = Router();
const adminController = new AdminContentController();
const publicController = new ContentController();

router.get("/content/faqs", publicController.listFaqs);
router.get("/content/banners", publicController.listBanners);

router.use("/admin/content", requireAdmin);
router.get("/admin/content/faqs", adminController.listFaqs);
router.post("/admin/content/faqs", adminController.createFaq);
router.put("/admin/content/faqs/:id", adminController.updateFaq);
router.delete("/admin/content/faqs/:id", adminController.deleteFaq);

router.get("/admin/content/banners", adminController.listBanners);
router.post("/admin/content/banners", adminController.createBanner);
router.put("/admin/content/banners/:id", adminController.updateBanner);
router.delete("/admin/content/banners/:id", adminController.deleteBanner);

export default router;
