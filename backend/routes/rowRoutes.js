import express from "express";
import {
    createRow,
    deleteRow,
    getRow,
    updateRow
} from "../controllers/rowController.js";

const router = express.Router();

router.post("/create", createRow)
router.get("/", getRow)
router.patch("/:id", updateRow)
router.delete("/:id", deleteRow)


export default router;
