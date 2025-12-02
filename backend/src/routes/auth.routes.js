import { Router } from "express";
import { register, login } from "../controllers/auth.controller.js";

const router = Router();

// público
router.post("/register", register);
router.post("/login", login);
export default router;