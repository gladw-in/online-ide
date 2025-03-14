import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import EditorRoutes from "../routes/EditorRoutes";

const MainBody = ({ isDarkMode, toggleTheme }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#f3f3f3] dark:bg-gray-900 dark:text-white select-none dark:[color-scheme:dark]">
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      <EditorRoutes isDarkMode={isDarkMode} />
      <Footer />
    </div>
  );
};

export default MainBody;
