import express from "express";
import { createExercises, deleteExercise, getExerciseById, getExercises, updateExercise } from "../controllers/exerciseController.js";


const router = express.Router();

router.post("/create", createExercises)
router.get("/", getExercises)
router.get("/:id", getExerciseById)
router.patch("/:id", updateExercise)
router.delete("/:id", deleteExercise)


export default router;
