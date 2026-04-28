import express from "express";
import {
  createCourse,
  deleteCourse,
  getCourseById,
  getCourseRating,
  getCourses,
  getEducatorCourses,
  rateCourse,
  updateCourse,
} from "../controllers/courses.js";

const courseRouter = express.Router();

courseRouter.get("/", getCourses);
courseRouter.get("/educator/:educatorId", getEducatorCourses);
courseRouter.get("/:id/rating", getCourseRating);
courseRouter.get("/:id", getCourseById);
courseRouter.post("/", createCourse);
courseRouter.post("/:id/rating", rateCourse);
courseRouter.put("/:id", updateCourse);
courseRouter.delete("/:id", deleteCourse);

export default courseRouter;
