// GET /api/auth/me:
import express from "express";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.get("/me", authMiddleware);

export default router;
// Requires Clerk session.

// Upsert your User row by clerkId (create if missing; set email; role defaults for first seed or stays whatever is in DB).

// Return { id, email, role }.