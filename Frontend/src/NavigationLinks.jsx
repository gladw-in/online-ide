import React, { useEffect } from "react";
import { Link } from "react-router-dom";

const navLinks = [
  {
    to: "/editor",
    text: "HTML, CSS, JS",
    bgClass: "bg-blue-500",
  },
  {
    to: "/python",
    text: "Python",
    bgClass: "bg-green-500",
  },
  {
    to: "/javascript",
    text: "Javascript",
    bgClass: "bg-purple-500",
  },
];

const NavigationLinks = () => {
  useEffect(() => {
    document.title = "Online IDE - HTML, CSS, JS, PYTHON AND JAVASCRIPT";
  }, []);

  return (
    <div className="flex flex-col md:flex-row justify-center items-center min-h-[75vh] gap-6 mb-6">
      {navLinks.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className={`px-8 py-4 text-xl font-semibold ${link.bgClass} text-white rounded-lg shadow-lg hover:scale-105 transition-all duration-300 sm:px-6 sm:py-3 sm:text-lg md:px-8 md:py-4 md:text-xl lg:px-10 lg:py-5 lg:text-2xl`}
        >
          {link.text}
        </Link>
      ))}
    </div>
  );
};

export default NavigationLinks;
