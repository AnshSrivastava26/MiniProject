import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";
import { useUser } from "@clerk/clerk-react";
import { apiRequest } from "../lib/api";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const currency = "$";
  // const currency = process.env.VITE_CURRENCY;
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();

  const [allCourses, setAllCourses] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isEducator, setIsEducator] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);

  const fetchAllCourses = async (search = "") => {
    try {
      setIsLoadingCourses(true);
      const query = search ? `?search=${encodeURIComponent(search)}` : "";
      const data = await apiRequest(`/api/courses${query}`);
      setAllCourses(data.courses || []);
      return data.courses || [];
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const fetchCourseById = async (courseId) => {
    const data = await apiRequest(`/api/courses/${courseId}`);
    return data.course;
  };

  const syncCurrentUser = async () => {
    if (!user) {
      setCurrentUser(null);
      setIsEducator(false);
      setEnrolledCourses([]);
      return null;
    }

    const primaryEmail =
      user.primaryEmailAddress?.emailAddress ||
      user.emailAddresses?.[0]?.emailAddress;

    const data = await apiRequest("/api/users/sync", {
      method: "POST",
      body: JSON.stringify({
        _id: user.id,
        name: user.fullName || user.username || "Student",
        email: primaryEmail,
        imageUrl: user.imageUrl,
      }),
    });

    setCurrentUser(data.user);
    setIsEducator(["educator", "admin"].includes(data.user.role));
    setEnrolledCourses(data.user.enrolledCourses || []);
    return data.user;
  };

  const calculateRating = (course) => {
    if (!course?.courseRatings || course.courseRatings.length === 0) {
      return 0;
    }
    let totalRating = 0;
    course.courseRatings.forEach((rating) => {
      totalRating += rating.rating;
    });
    return totalRating / course.courseRatings.length;
  };

  const calculateChapterTime = (chapter) => {
    let time = 0;
    chapter.chapterContent?.forEach(
      (lecture) => (time += Number(lecture.lectureDuration || 0))
    );
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  };

  const calculateCourseDuration = (course) => {
    let time = 0;
    course.courseContent?.forEach((chapter) =>
      chapter.chapterContent?.forEach(
        (lecture) => (time += Number(lecture.lectureDuration || 0))
      )
    );
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  };
  const calculateNoOfLectures = (course) => {
    let totalLectures = 0;
    course.courseContent?.forEach((chapter) => {
      if (Array.isArray(chapter.chapterContent)) {
        totalLectures += chapter.chapterContent.length;
      }
    });
    return totalLectures;
  };
  const fetchUserEnrolledCourses = async (userId = user?.id) => {
    if (!userId) {
      setEnrolledCourses([]);
      return [];
    }

    const data = await apiRequest(`/api/enrollments/user/${userId}`);
    setEnrolledCourses(data.enrolledCourses || []);
    return data.enrolledCourses || [];
  };

  const enrollInCourse = async (courseId) => {
    if (!user) {
      throw new Error("Please sign in as a student before enrolling.");
    }

    await syncCurrentUser();

    const data = await apiRequest("/api/enrollments", {
      method: "POST",
      body: JSON.stringify({ userId: user.id, courseId }),
    });

    setEnrolledCourses(data.enrolledCourses || []);
    await fetchAllCourses();
    return data.enrolledCourses || [];
  };

  const becomeEducator = async () => {
    const syncedUser = currentUser || (await syncCurrentUser());

    if (!syncedUser) {
      throw new Error("Please sign in before becoming an educator.");
    }

    const data = await apiRequest(`/api/users/${syncedUser._id}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role: "educator" }),
    });

    setCurrentUser(data.user);
    setIsEducator(true);
    return data.user;
  };

  const createCourse = async (course) => {
    const syncedUser = currentUser || (await syncCurrentUser());

    if (!syncedUser) {
      throw new Error("Please sign in before adding a course.");
    }

    const data = await apiRequest("/api/courses", {
      method: "POST",
      body: JSON.stringify({
        ...course,
        educator: syncedUser._id,
        educatorName: syncedUser.name,
      }),
    });

    await fetchAllCourses();
    return data.course;
  };

  const fetchEducatorCourses = async (educatorId = currentUser?._id) => {
    if (!educatorId) {
      return [];
    }

    const data = await apiRequest(`/api/courses/educator/${educatorId}`);
    return data.courses || [];
  };

  const fetchEnrollmentRecords = async () => {
    const data = await apiRequest("/api/enrollments");
    return data.enrollments || [];
  };

  const fetchStudents = async () => {
    const data = await apiRequest("/api/users?role=student");
    return data.users || [];
  };

  const fetchDashboardData = async (educatorId = currentUser?._id) => {
    const path = educatorId
      ? `/api/enrollments/dashboard/${educatorId}`
      : "/api/enrollments/dashboard";
    const data = await apiRequest(path);
    return data.dashboardData;
  };

  const rateCourse = async (courseId, rating) => {
    if (!user) {
      throw new Error("Please sign in before rating this course.");
    }

    const data = await apiRequest(`/api/courses/${courseId}/rating`, {
      method: "POST",
      body: JSON.stringify({ userId: user.id, rating }),
    });

    const updateCourse = (course) =>
      course._id === data.course._id ? data.course : course;

    setAllCourses((courses) => courses.map(updateCourse));
    setEnrolledCourses((courses) => courses.map(updateCourse));

    return data.course;
  };

  useEffect(() => {
    fetchAllCourses();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      syncCurrentUser().catch((error) => {
        console.error(error.message);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, user?.id]);

  const value = {
    currency,
    allCourses,
    navigate,
    currentUser,
    calculateRating,
    isEducator,
    setIsEducator,
    calculateChapterTime,
    calculateCourseDuration,
    calculateNoOfLectures,
    enrolledCourses,
    isLoadingCourses,
    becomeEducator,
    createCourse,
    enrollInCourse,
    fetchAllCourses,
    fetchCourseById,
    fetchEducatorCourses,
    fetchEnrollmentRecords,
    fetchStudents,
    fetchDashboardData,
    rateCourse,
    syncCurrentUser,
    fetchUserEnrolledCourses,
  };
  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};
