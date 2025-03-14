import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider, ThemeContext } from "./context/ThemeProvider";
import MainBody from "./components/MainBody";

const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <ThemeContext.Consumer>
          {({ isDarkMode, toggleTheme }) => (
            <MainBody isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
          )}
        </ThemeContext.Consumer>
      </Router>
    </ThemeProvider>
  );
};

export default App;
