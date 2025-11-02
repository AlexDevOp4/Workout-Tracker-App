import express from "express";
import { createUser } from "../controllers/clientController.js";

const router = express.Router();

router.post("/create", createUser);

export default router;
