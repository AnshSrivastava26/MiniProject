import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema(
  {
    lectureId: { type: String, required: true },
    lectureTitle: { type: String, required: true },
    lectureDuration: { type: Number, required: true, min: 0 },
    lectureUrl: { type: String, required: true },
    isPreviewFree: { type: Boolean, default: false },
    lectureOrder: { type: Number, required: true },
  },
  { _id: false }
);

const chapterSchema = new mongoose.Schema(
  {
    chapterId: { type: String, required: true },
    chapterOrder: { type: Number, required: true },
    chapterTitle: { type: String, required: true },
    chapterContent: { type: [lectureSchema], default: [] },
  },
  { _id: false }
);

const ratingSchema = new mongoose.Schema(
  {
    userId: { type: String, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
  },
  { timestamps: true }
);

const courseSchema = new mongoose.Schema(
  {
    courseTitle: { type: String, required: true, trim: true },
    courseDescription: { type: String, required: true },
    coursePrice: { type: Number, required: true, min: 0 },
    isPublished: { type: Boolean, default: true },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    courseContent: { type: [chapterSchema], default: [] },
    educator: { type: String, ref: "User", required: true },
    educatorName: { type: String, default: "LearnStack" },
    enrolledStudents: [{ type: String, ref: "User" }],
    courseRatings: { type: [ratingSchema], default: [] },
    courseThumbnail: { type: String, required: true },
  },
  { timestamps: true }
);

courseSchema.index({ courseTitle: "text", courseDescription: "text" });

const Course = mongoose.model("Course", courseSchema);

export default Course;
