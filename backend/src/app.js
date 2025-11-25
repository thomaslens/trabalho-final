import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import tasksRoutes from "./routes/tasks.routes.js";

const app = express();

// libera CORS
app.use(cors());

// body JSON
app.use(express.json());

// rota teste
app.get("/", (req, res) => res.send("API Task Manager OK"));

// prefixos
app.use("/auth", authRoutes);
app.use("/tasks", tasksRoutes);

export default app;