import Course from "../models/course.js";
import User from "../models/users.js";

const buildCoursePayload = (body) => ({
  courseTitle: body.courseTitle,
  courseDescription: body.courseDescription,
  coursePrice: Number(body.coursePrice),
  isPublished: body.isPublished ?? true,
  discount: Number(body.discount || 0),
  courseContent: body.courseContent || [],
  educator: body.educator,
  educatorName: body.educatorName || "LearnStack",
  courseThumbnail: body.courseThumbnail,
});

export const getCourses = async (req, res) => {
  try {
    const query = {};

    if (req.query.search) {
      query.courseTitle = { $regex: req.query.search, $options: "i" };
    }

    if (req.query.published !== "false") {
      query.isPublished = true;
    }

    const courses = await Course.find(query).sort({ createdAt: -1 });

    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCourseRating = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).select(
      "courseRatings"
    );

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const totalRatings = course.courseRatings.length;
    const averageRating =
      totalRatings === 0
        ? 0
        : course.courseRatings.reduce((total, item) => total + item.rating, 0) /
          totalRatings;

    const userRating = req.query.userId
      ? course.courseRatings.find((item) => item.userId === req.query.userId)
          ?.rating || 0
      : 0;

    res.json({
      success: true,
      averageRating,
      totalRatings,
      userRating,
      ratings: course.courseRatings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEducatorCourses = async (req, res) => {
  try {
    const courses = await Course.find({ educator: req.params.educatorId }).sort(
      { createdAt: -1 }
    );

    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCourse = async (req, res) => {
  try {
    const courseData = buildCoursePayload(req.body);

    if (
      !courseData.courseTitle ||
      !courseData.courseDescription ||
      !courseData.courseThumbnail ||
      !courseData.educator
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Course title, description, thumbnail URL, and educator are required",
      });
    }

    const course = await Course.create(courseData);

    await User.findByIdAndUpdate(courseData.educator, {
      $setOnInsert: {
        name: courseData.educatorName,
        email: `${courseData.educator}@local.lms`,
        imageUrl: "",
      },
      $set: { role: "educator" },
    }, { upsert: true });

    res.status(201).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      buildCoursePayload(req.body),
      { new: true, runValidators: true }
    );

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    await User.updateMany(
      { enrolledCourses: req.params.id },
      { $pull: { enrolledCourses: req.params.id } }
    );

    res.json({ success: true, message: "Course deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const rateCourse = async (req, res) => {
  try {
    const { userId, rating } = req.body;
    const ratingValue = Number(rating);

    if (!userId || !ratingValue) {
      return res.status(400).json({
        success: false,
        message: "userId and rating are required",
      });
    }

    if (ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const [course, user] = await Promise.all([
      Course.findById(req.params.id),
      User.findById(userId),
    ]);

    if (!course || !user) {
      return res.status(404).json({
        success: false,
        message: "Course or user not found",
      });
    }

    const isEnrolled =
      course.enrolledStudents.includes(userId) ||
      user.enrolledCourses.some(
        (courseId) => courseId.toString() === course._id.toString()
      );

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: "Only enrolled students can rate this course",
      });
    }

    const existingRating = course.courseRatings.find(
      (item) => item.userId === userId
    );

    if (existingRating) {
      existingRating.rating = ratingValue;
    } else {
      course.courseRatings.push({ userId, rating: ratingValue });
    }

    await course.save();

    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
