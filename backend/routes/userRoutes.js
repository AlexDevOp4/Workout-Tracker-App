import express from "express";
import {
  getUsers,
  getUserById,
  updateUserById,
  createUser,
  deleteUserById
} from "../controllers/userController.js";

const router = express.Router();

router.get("/", getUsers);
router.get("/:id", getUserById);
router.patch("/:id", updateUserById);
router.post("/create", createUser)
router.delete("/:id", deleteUserById)

export default router;
