import express from "express";
import {
  enrollInCourse,
  getDashboardData,
  getEnrollmentRecords,
  getUserEnrollments,
} from "../controllers/enrollments.js";

const enrollmentRouter = express.Router();

enrollmentRouter.post("/", enrollInCourse);
enrollmentRouter.get("/", getEnrollmentRecords);
enrollmentRouter.get("/user/:userId", getUserEnrollments);
enrollmentRouter.get("/dashboard", getDashboardData);
enrollmentRouter.get("/dashboard/:educatorId", getDashboardData);

export default enrollmentRouter;
