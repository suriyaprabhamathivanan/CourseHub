import React from "react";
import { useNavigate } from "react-router-dom";

const Navbar = ({ currentUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  return (
    <nav className="w-full bg-gradient-to-r from-blue-500 to-purple-600 p-4 flex justify-between items-center text-white shadow-lg">
      <h1
        className="text-2xl font-bold cursor-pointer"
        onClick={() => navigate("/main")}
      >
        Course Designer
      </h1>
      {currentUser && (
        <div className="flex items-center gap-4">
          <span className="bg-white text-blue-600 px-3 py-1 rounded-full font-semibold">
            {currentUser.name}
          </span>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
