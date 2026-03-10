import { Router } from "express";
import { AiSymptomsController } from "../controllers/ai-symptoms.controller";

const router = Router();
const controller = new AiSymptomsController();

router.post("/symptoms", controller.analyze);

export default router;
