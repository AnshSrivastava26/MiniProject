import React, { useContext } from "react";
import { assets } from "../../assets/assets";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useClerk, UserButton, useUser } from "@clerk/clerk-react";
import { AppContext } from "../../context/AppContext";

const Navbar = () => {
  const { navigate, isEducator, becomeEducator } = useContext(AppContext);
  const location = useLocation();
  const isCourseListPage = location.pathname.includes("/course-list");
  const { openSignIn, openSignUp } = useClerk();
  const { user } = useUser();

  const handleEducatorClick = async () => {
    if (!user) {
      openSignIn();
      return;
    }

    if (!isEducator) {
      await becomeEducator();
    }

    navigate("/educator");
  };

  return (
    <div
      className={`flex items-center justify-between px-4 sm:px-10 md:px-14 lg:px-36 border-b border-gray-500 py-4 ${
        isCourseListPage ? "bg-red" : "bg-cyan-100/70"
      }`}
    >
      <img
        onClick={() => {
          navigate("/");
        }}
        src={assets.logo}
        alt="Logo"
        className="w-28 lg:w-32 cursor-pointer"
      />

      <div className="hidden md:flex items-center gap-5 text-gray-500">
        <div className="flex md:flex items-center gap-5">
          {user && (
            <>
              <button
                onClick={handleEducatorClick}
              >
                {isEducator ? "Educator Dashboard" : "Become Educator"}
              </button>{" "}
              |<Link to="/my-enrollments">My Enrollments</Link>
            </>
          )}
        </div>
        {user ? (
          <UserButton />
        ) : (
          <div className="flex items-center gap-3">
            <button onClick={() => openSignIn()}>Student Login</button>
            <button
              onClick={() => openSignUp()}
              className="bg-blue-600 text-white px-5 py-2 rounded-full"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>

      {/* For Phone Screen */}
      <div className="md:hidden flex items-center gap-2 sm:gap-5 text-gray-500">
        <div className="flex items-center gap-1 sm:gap-2 max:sm:text-xs pr-2">
          {user && (
            <>
              <button
                onClick={handleEducatorClick}
              >
                {isEducator ? "Educator Dashboard" : "Become Educator"}
              </button>{" "}
              <Link to="/my-enrollments">My Enrollments</Link>
            </>
          )}
        </div>
        {user ? (
          <UserButton />
        ) : (
          <button onClick={() => openSignIn()}>
            <img src={assets.user_icon} alt="" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
