import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { faPython } from "@fortawesome/free-brands-svg-icons";
import { faJsSquare } from "@fortawesome/free-brands-svg-icons";
import Header from "./Header";
import Editor from "./Editor";
import Accounts from "./Accounts";
import NotFound from "./NotFound";
import CodeEditor from "./CodeEditor";
import Login from "./Login";
import Register from "./Register";
import NavigationLinks from "./NavigationLinks";
import Footer from "./Footer";
import samplePy from "./samples/python.py?raw";
import sampleJs from "./samples/javascript.js?raw";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark";
  });

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem("theme", newMode ? "dark" : "light");
      return newMode;
    });
  };

  useEffect(() => {
    const htmlElement = document.documentElement;
    if (isDarkMode) {
      htmlElement.classList.add("dark");
    } else {
      htmlElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const renderCodeEditor = (language, icon, apiEndpoint, defaultCode) => (
    <CodeEditor
      language={language}
      icon={icon}
      apiEndpoint={apiEndpoint}
      isDarkMode={isDarkMode}
      defaultCode={defaultCode}
    />
  );

  const isAuthenticated = () => !!localStorage.getItem("token");

  const ProtectedRoute = ({ element }) => {
    return isAuthenticated() ? element : <Navigate to="/login" />;
  };

  const RedirectedRoute = ({ element }) => {
    return !isAuthenticated() ? element : <Navigate to="/" />;
  };

  const EditorRoutes = () => (
    <div className="flex-grow">
      <Routes>
        <Route
          path="/register"
          element={<RedirectedRoute element={<Register />} />}
        />
        <Route
          path="/login"
          element={<RedirectedRoute element={<Login />} />}
        />
        <Route
          path="/accounts"
          element={<ProtectedRoute element={<Accounts />} />}
        />
        <Route path="/" element={<NavigationLinks />} />
        <Route path="/editor" element={<Editor isDarkMode={isDarkMode} />} />
        <Route
          path="/python"
          element={renderCodeEditor(
            "python",
            faPython,
            `${import.meta.env.VITE_PYTHON_MINIFIER_API_URL}/run`,
            samplePy
          )}
        />
        <Route
          path="/javascript"
          element={renderCodeEditor("javascript", faJsSquare, "", sampleJs)}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );

  return (
    <Router
      future={{
        v7_relativeSplatPath: true,
        v7_startTransition: true,
      }}
    >
      <div
        className={`min-h-screen flex flex-col dark:bg-gray-900 dark:text-white select-none dark:[color-scheme:dark] ${
          isDarkMode ? "dark" : ""
        }`}
      >
        <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
        <EditorRoutes />
        <Footer />
      </div>
    </Router>
  );
}

export default App;
