import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/mongodb.js";
import { clerkWebhooks } from "./controllers/webhooks.js";
import courseRouter from "./routes/courseRoutes.js";
import enrollmentRouter from "./routes/enrollmentRoutes.js";
import userRouter from "./routes/userRoutes.js";


const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://mini-project-rho-lovat.vercel.app",
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",") : []),
].map((origin) => origin.trim().replace(/\/$/, ""));

await connectDB();
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));

app.get("/", (req, res) => {
  res.send("API Working");
});

app.post("/clerk", clerkWebhooks);
app.use("/api/courses", courseRouter);
app.use("/api/users", userRouter);
app.use("/api/enrollments", enrollmentRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
