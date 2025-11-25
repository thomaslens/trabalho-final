import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask
} from "../controllers/tasks.controller.js";

const router = Router();

// tudo abaixo exige token
router.use(authMiddleware);

// CRUD
router.get("/", getTasks);
router.post("/", createTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;