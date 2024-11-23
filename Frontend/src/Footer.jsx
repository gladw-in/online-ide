import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="text-center p-4 bg-gray-800 text-white">
      <p className="text-sm md:text-base lg:text-lg">
        &copy; {currentYear} Online IDE
      </p>
    </div>
  );
};

export default Footer;
