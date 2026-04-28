import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { Line } from "rc-progress";
import Footer from "../../components/student/Footer";
import { useClerk, useUser } from "@clerk/clerk-react";

const MyEnrollments = () => {
  const {
    enrolledCourses,
    calculateCourseDuration,
    fetchUserEnrolledCourses,
    navigate,
  } = useContext(AppContext);
  const { user } = useUser();
  const { openSignIn } = useClerk();
  const [progressArray] = useState([
    { lectureCompleted: 2, totalLectures: 4 },
    { lectureCompleted: 1, totalLectures: 5 },
    { lectureCompleted: 3, totalLectures: 6 },
    { lectureCompleted: 4, totalLectures: 4 },
    { lectureCompleted: 0, totalLectures: 3 },
    { lectureCompleted: 5, totalLectures: 7 },
    { lectureCompleted: 6, totalLectures: 8 },
    { lectureCompleted: 2, totalLectures: 6 },
    { lectureCompleted: 4, totalLectures: 10 },
    { lectureCompleted: 3, totalLectures: 5 },
    { lectureCompleted: 7, totalLectures: 7 },
    { lectureCompleted: 1, totalLectures: 4 },
    { lectureCompleted: 0, totalLectures: 2 },
    { lectureCompleted: 5, totalLectures: 5 },
  ]);

  useEffect(() => {
    if (user) {
      fetchUserEnrolledCourses(user.id).catch(console.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (!user) {
    return (
      <>
        <div className="md:px-36 px-8 pt-10 min-h-[60vh]">
          <h1 className="text-2xl font-semibold">My Enrollments</h1>
          <p className="text-gray-500 mt-4">
            Sign in as a student to view your enrolled courses.
          </p>
          <button
            onClick={() => openSignIn()}
            className="mt-5 px-5 py-2 bg-blue-600 text-white rounded"
          >
            Student Login
          </button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div className="md:px-36 px-8 pt-10">
        <h1 className="text-2xl font-semibold">My Enrollments</h1>
        <table className="md:table-auto table-fixed w-full overflow-hidden border mt-10">
          <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left max-sm:hidden">
            <tr>
              <th className="px-4 py-3 font-semibold truncate">Course</th>
              <th className="px-4 py-3 font-semibold truncate">Duration</th>
              <th className="px-4 py-3 font-semibold truncate">Completed</th>
              <th className="px-4 py-3 font-semibold truncate">Status</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {enrolledCourses.map((courses, index) => {
              const progress = progressArray[index] || {
                lectureCompleted: 0,
                totalLectures: 1,
              };

              return (
              <tr key={index} className="border-b border-gray-500/20">
                <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3">
                  <img
                    src={courses.courseThumbnail}
                    alt=""
                    className="w-14 sm:w-24 md:w-28"
                  />
                  <div className="flex-1">
                    <p className="mb-1 max-sm:text-sm">{courses.courseTitle}</p>
                    <Line
                      strokeWidth={2}
                      percent={
                        (progress.lectureCompleted / progress.totalLectures) *
                        100
                      }
                      className="bg-gray-300 rounded-full"
                    />
                  </div>
                </td>
                <td className="px-4 py-3 max-sm:hidden">
                  {calculateCourseDuration(courses)}
                </td>
                <td className="px-4 py-3 max-sm:hidden">
                  {`${progress.lectureCompleted}/${progress.totalLectures}`}{" "}
                  <span>Lectures</span>
                </td>
                <td className="px-4 py-3 max-sm:text-right">
                  <button
                    className="px-3 sm:px-5 py-1.5 sm:py-2 bg-blue-600 max-sm:text-xs text-white"
                    onClick={() => navigate("/player/" + courses._id)}
                  >
                    {progress.lectureCompleted / progress.totalLectures === 1
                      ? "Completed"
                      : "On Going"}
                  </button>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
        {enrolledCourses.length === 0 && (
          <p className="text-gray-500 mt-6">
            You are not enrolled in any courses yet.
          </p>
        )}
      </div>
      <Footer />
    </>
  );
};

export default MyEnrollments;
