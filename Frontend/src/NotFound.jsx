import React from "react";
import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-800">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-red-500 dark:text-red-400">
          404 - Page Not Found
        </h2>
        <p className="mt-4 text-lg text-gray-800 dark:text-gray-300">
          The page you are looking for does not exist.
        </p>
        <div className="mt-6">
          <button
            onClick={goBack}
            className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
