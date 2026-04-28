import Course from "../models/course.js";
import User from "../models/users.js";

export const enrollInCourse = async (req, res) => {
  try {
    const { userId, courseId } = req.body;

    if (!userId || !courseId) {
      return res.status(400).json({
        success: false,
        message: "userId and courseId are required",
      });
    }

    const user = await User.findById(userId);
    const course = await Course.findById(courseId);

    if (!user || !course) {
      return res.status(404).json({
        success: false,
        message: "User or course not found",
      });
    }

    await User.findByIdAndUpdate(userId, {
      $addToSet: { enrolledCourses: courseId },
    });

    await Course.findByIdAndUpdate(courseId, {
      $addToSet: { enrolledStudents: userId },
    });

    const enrolledCourses = await Course.find({ enrolledStudents: userId });

    res.json({ success: true, enrolledCourses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserEnrollments = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate(
      "enrolledCourses"
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, enrolledCourses: user.enrolledCourses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEnrollmentRecords = async (req, res) => {
  try {
    const courses = await Course.find({
      enrolledStudents: { $exists: true, $ne: [] },
    }).lean();

    const studentIds = [
      ...new Set(courses.flatMap((course) => course.enrolledStudents)),
    ];

    const students = await User.find({ _id: { $in: studentIds } }).lean();
    const studentById = new Map(students.map((student) => [student._id, student]));

    const enrollments = courses.flatMap((course) =>
      course.enrolledStudents.map((studentId) => ({
        student: studentById.get(studentId) || {
          _id: studentId,
          name: "Unknown student",
          imageUrl: "",
        },
        courseTitle: course.courseTitle,
        purchaseDate: course.updatedAt,
      }))
    );

    res.json({ success: true, enrollments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDashboardData = async (req, res) => {
  try {
    const query = req.params.educatorId
      ? { educator: req.params.educatorId }
      : {};

    const courses = await Course.find(query).lean();
    const studentIds = [
      ...new Set(courses.flatMap((course) => course.enrolledStudents)),
    ];
    const students = await User.find({ _id: { $in: studentIds } }).lean();
    const studentById = new Map(students.map((student) => [student._id, student]));

    const enrolledStudentsData = courses.flatMap((course) =>
      course.enrolledStudents.map((studentId) => ({
        courseTitle: course.courseTitle,
        student: studentById.get(studentId) || {
          _id: studentId,
          name: "Unknown student",
          imageUrl: "",
        },
      }))
    );

    const totalEarnings = courses.reduce((total, course) => {
      const discountedPrice =
        course.coursePrice - (course.discount * course.coursePrice) / 100;
      return total + discountedPrice * course.enrolledStudents.length;
    }, 0);

    res.json({
      success: true,
      dashboardData: {
        totalCourses: courses.length,
        totalEarnings: Number(totalEarnings.toFixed(2)),
        enrolledStudentsData,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
