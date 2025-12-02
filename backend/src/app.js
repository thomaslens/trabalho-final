import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js"
import tasksRoutes from "./routes/tasks.routes.js";

const app = express();
app.use(express.json());
// app.use(express.static('frontend'))
// // libera CORS
const corsOptions = {
    origin:'http://127.0.0.1:5500',
    optionsSuccessStatus: 200,
}; 
app.use(cors(corsOptions)); 

// usado quando o front e o backend estao em dominios diferentes

// body JSON


// rota teste
//app.get("/", (req, res) =>res.send("API Task Manager OK"));

// prefixos
app.use("/auth", authRoutes);
app.use("/tasks", tasksRoutes);

export default app;