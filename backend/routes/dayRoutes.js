import { Router } from "express";
import {
  getDays,
  getDayById,
  createDay,
  updateDay,
  deleteDay,
} from "../controllers/dayController.js";

const router = Router();

router.get("/", getDays);
router.get("/:id", getDayById);
router.post("/", createDay);
router.put("/:id", updateDay);
router.delete("/:id", deleteDay);

export default router;
