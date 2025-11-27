import express from "express";
import {
  getUsers,
  getUserById,
  updateUserById,
  createUser,
  deleteUserById,
  getClientUsers,
  getTrainers,
  getUserByClerkId
} from "../controllers/userController.js";

const router = express.Router();

router.get("/", getUsers);
router.get("/:clerkId", getUserByClerkId)
router.get("/clients", getClientUsers);
router.get("/trainers", getTrainers);
router.get("/:id", getUserById);
router.patch("/:id", updateUserById);
router.post("/create", createUser);
router.delete("/:id", deleteUserById);

export default router;
