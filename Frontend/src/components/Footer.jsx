import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="text-center p-4 bg-gray-800 text-white">
      <p className="text-sm md:text-base lg:text-lg flex items-center justify-center">
        <span>&copy; {currentYear} Online IDE</span>
      </p>
    </footer>
  );
};

export default Footer;