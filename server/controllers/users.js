import User from "../models/users.js";

const getUserPayload = (body) => ({
  _id: body._id || body.id || body.userId,
  name: body.name || "Student",
  email: body.email,
  imageUrl: body.imageUrl || "",
});

export const syncUser = async (req, res) => {
  try {
    const userData = getUserPayload(req.body);

    if (!userData._id || !userData.email) {
      return res.status(400).json({
        success: false,
        message: "User id and email are required",
      });
    }

    const user = await User.findByIdAndUpdate(
      userData._id,
      { $set: userData, $setOnInsert: { role: "student" } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate("enrolledCourses");

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const query = {};

    if (req.query.role) {
      query.role = req.query.role;
    }

    const users = await User.find(query)
      .populate("enrolledCourses")
      .sort({ createdAt: -1 });

    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "enrolledCourses"
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const setUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["student", "educator", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be student, educator, or admin",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).populate("enrolledCourses");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
