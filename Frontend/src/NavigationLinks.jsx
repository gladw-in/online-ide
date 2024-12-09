import React, { useEffect } from "react";
import { Link } from "react-router-dom";

const navLinks = [
  {
    to: "/htmlcssjs",
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
  {
    to: "/c",
    text: "C",
    bgClass: "bg-red-500",
  },
  {
    to: "/cpp",
    text: "C++",
    bgClass: "bg-blue-700",
  },
  {
    to: "/java",
    text: "Java",
    bgClass: "bg-orange-500",
  },
  {
    to: "/csharp",
    text: "C#",
    bgClass: "bg-teal-500",
  },
  {
    to: "/rust",
    text: "Rust",
    bgClass: "bg-yellow-600",
  },
  {
    to: "/go",
    text: "Go",
    bgClass: "bg-green-700",
  },
  {
    to: "/php",
    text: "PHP",
    bgClass: "bg-purple-600",
  },
];

const NavigationLinks = () => {
  useEffect(() => {
    document.title =
      "Online IDE - HTML, CSS, JS, PYTHON, C, C++, JAVA, RUST and PHP";
  }, []);

  return (
    <div className="flex justify-center items-center min-h-[75vh] p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-6 px-4 sm:px-6 md:px-8 lg:px-8">
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`w-full px-8 py-4 text-xl font-semibold ${link.bgClass} text-white text-center rounded-lg shadow-lg hover:scale-105 transform transition-all duration-300 sm:px-6 sm:py-3 sm:text-lg md:px-8 md:py-4 lg:px-8 lg:py-4`}
          >
            {link.text}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default NavigationLinks;
