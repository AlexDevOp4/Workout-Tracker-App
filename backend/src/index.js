// Load env, enable CORS with origin=CORS_ORIGIN and credentials=true.
import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import {
  clerkMiddleware,
  clerkClient,
  requireAuth,
  getAuth,
} from "@clerk/express";
import auth from "../routes/auth.js";
import clientRoutes from "../routes/clientRoutes.js";
import userRoutes from "../routes/userRoutes.js";
import programRoutes from '../routes/programRoutes.js'
import weekRoutes from '../routes/weekRoutes.js'
import pkg from "@prisma/client";
const { PrismaClient, Prisma } = pkg;

export const prisma = new PrismaClient({
  log: ["query", "warn", "error"],
});
// CORS config
const corsOptions = {
  origin: ["http://localhost:3000"],
  credentials: true,
};

const app = express();
const PORT = process.env.PORT || 40000;

app.use(cors(corsOptions));
app.use(express.json());
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: [
          "'self'",
          "http://localhost:4000",
          "http://localhost:8080",
          "ws://localhost:4000",
          "ws://localhost:8080",
        ],
        scriptSrc: ["'self'", "'unsafe-eval'"], // dev only (Next/Vite need it)
        imgSrc: ["'self'", "data:", "blob:"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  })
);

app.use(clerkMiddleware());

app.get("/", async (req, res) => {
  const getUsers = await clerkClient.users.getUserList();
  return res.json(getUsers);
});

app.use("/api/client", clientRoutes);
app.use("/api/users", userRoutes);
app.use("/api/programs", programRoutes)
app.use("/api/weeks", weekRoutes)

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
