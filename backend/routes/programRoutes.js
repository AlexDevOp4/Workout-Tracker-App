import express from "express";
import { createProgram, getProgramById, getPrograms, rollForward, softDeleteProgram, updateProgram } from "../controllers/programController.js";


const router = express.Router();

router.post("/", createProgram)
router.post("/:id", softDeleteProgram)
router.get("/", getPrograms)
router.get("/:id", getProgramById)
router.patch("/:id", updateProgram)
router.post("/:programId/weeks/:weekNumber/roll-forward", rollForward)


export default router;
