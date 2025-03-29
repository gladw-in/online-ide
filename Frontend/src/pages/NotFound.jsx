import React, { useEffect } from "react";
import { VscHome } from "react-icons/vsc";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "404 - Page Not Found";
  }, []);

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-2 bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-red-500 dark:text-red-400">
          404 - Page Not Found
        </h2>
        <p className="mt-4 text-lg text-gray-800 dark:text-gray-300">
          The page you are looking for does not exist.
        </p>
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleGoHome}
            className="px-6 py-3 bg-blue-500 text-white rounded-md cursor-pointer dark:bg-blue-700 flex items-center space-x-2 transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
          >
            <VscHome className="text-xl mr-2" />
            Go to Homepage
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
