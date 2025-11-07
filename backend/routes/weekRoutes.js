import express from "express";
import { createWeeks, getWeekById, getWeekByProgramId, updateDeloadWeek } from "../controllers/weekController.js";


const router = express.Router();


router.post("/create", createWeeks)
router.get("/", getWeekByProgramId)
router.get("/:id", getWeekById)
router.patch("/:id", updateDeloadWeek)

export default router;
