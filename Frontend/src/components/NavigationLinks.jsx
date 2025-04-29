import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import SharedLinks from "./SharedLinks";

const navLinks = [
  {
    to: "/htmlcssjs",
    text: "HTML, CSS, JS",
    classes: "bg-blue-500 motion-delay-[400ms]",
  },
  {
    to: "/python",
    text: "Python",
    classes: "bg-green-500 motion-delay-[450ms]",
  },
  {
    to: "/javascript",
    text: "Javascript",
    classes: "bg-purple-500 motion-delay-[500ms]",
  },
  {
    to: "/c",
    text: "C",
    classes: "bg-red-500 motion-delay-[550ms]",
  },
  {
    to: "/cpp",
    text: "C++",
    classes: "bg-blue-700 motion-delay-[600ms]",
  },
  {
    to: "/java",
    text: "Java",
    classes: "bg-orange-500 motion-delay-[650ms]",
  },
  {
    to: "/csharp",
    text: "C#",
    classes: "bg-teal-500 motion-delay-[700ms]",
  },
  {
    to: "/rust",
    text: "Rust",
    classes: "bg-yellow-600 motion-delay-[750ms]",
  },
  {
    to: "/go",
    text: "Go",
    classes: "bg-green-700 motion-delay-[800ms]",
  },
  {
    to: "/verilog",
    text: "Verilog",
    classes: "bg-gray-600 motion-delay-[850ms]",
  },
  {
    to: "/sql",
    text: "SQL",
    classes: "bg-indigo-500 motion-delay-[900ms]",
  },
  {
    to: "/mongodb",
    text: "MongoDB",
    classes: "bg-teal-600 motion-delay-[950ms]",
  },
  {
    to: "/swift",
    text: "Swift",
    classes: "bg-pink-500 motion-delay-[1000ms]",
  },
  {
    to: "/ruby",
    text: "Ruby",
    classes: "bg-red-600 motion-delay-[1050ms]",
  },
  {
    to: "/typescript",
    text: "Typescript",
    classes: "bg-blue-600 motion-delay-[1100ms]",
  },
  {
    to: "/dart",
    text: "Dart",
    classes: "bg-cyan-500 motion-delay-[1150ms]",
  },
  {
    to: "/kotlin",
    text: "Kotlin",
    classes: "bg-teal-700 motion-delay-[1200ms]",
  },
  {
    to: "/perl",
    text: "Perl",
    classes: "bg-pink-700 motion-delay-[1250ms]",
  },
  {
    to: "/scala",
    text: "Scala",
    classes: "bg-green-500 motion-delay-[1300ms]",
  },
  {
    to: "/julia",
    text: "Julia",
    classes: "bg-yellow-500 motion-delay-[1350ms]",
  },
];

const NavigationLinks = () => {
  const baseUrl = window.location.origin;

  useEffect(() => {
    document.title = "Online IDE - Glad432";
  }, []);

  return (
    <>
      <div className="flex justify-center items-center min-h-[65vh] p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-4 px-4 sm:px-6 md:px-8 lg:px-8">
          {navLinks.map(({ to, text, classes }) => (
            <Link
              key={to}
              to={`${baseUrl}${to}`}
              aria-label={`Navigate to ${text} Editor`}
              title={text}
              className={`w-full px-8 py-4 text-xl font-semibold motion-preset-rebound-down ${classes} text-white text-center rounded-lg shadow-lg whitespace-nowrap overflow-hidden text-ellipsis hover:scale-105 transform transition-all duration-300 sm:px-6 sm:py-3 sm:text-lg md:px-8 md:py-4 lg:px-8 lg:py-4`}
            >
              {text}
            </Link>
          ))}
        </div>
      </div>
      <SharedLinks />
    </>
  );
};

export default NavigationLinks;
