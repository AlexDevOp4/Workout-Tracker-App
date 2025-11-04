import express from "express";
import { createClient, getClientById, getClientlists, restoreClient, softDeleteClient, updateClientById } from "../controllers/clientController.js";

const router = express.Router();

router.post("/create/:id", createClient);
router.post("/:id/restore", restoreClient)
router.get('/', getClientlists)
router.get("/:id", getClientById)
router.patch("/:id", updateClientById)
router.delete("/:id", softDeleteClient)

export default router;
