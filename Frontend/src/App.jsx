import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import EditorRoutes from "./EditorRoutes";
import { ThemeProvider, ThemeContext } from "./ThemeProvider";

const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <ThemeContext.Consumer>
          {({ isDarkMode, toggleTheme }) => (
            <div
              id="main-div"
              className={`min-h-screen flex flex-col bg-[#f3f3f3] dark:bg-gray-900 dark:text-white select-none dark:[color-scheme:dark] ${
                isDarkMode ? "dark" : ""
              }`}
            >
              <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
              <EditorRoutes isDarkMode={isDarkMode} />
              <Footer />
            </div>
          )}
        </ThemeContext.Consumer>
      </Router>
    </ThemeProvider>
  );
};

export default App;
