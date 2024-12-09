import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import {
  faPython,
  faJsSquare,
  faCuttlefish,
  faJava,
  faRust,
  faGolang,
  faPhp,
} from "@fortawesome/free-brands-svg-icons";
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
import sampleC from "./samples/c.c?raw";
import sampleCpp from "./samples/cpp.cpp?raw";
import sampleJava from "./samples/java.java?raw";
import sampleCsharp from "./samples/csharp.cs?raw";
import sampleRust from "./samples/rust.rs?raw";
import sampleGo from "./samples/go.go?raw";
import samplePHP from "./samples/php.php?raw";

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
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
        <Route path="/htmlcssjs" element={<Editor isDarkMode={isDarkMode} />} />
        <Route
          path="/python"
          element={renderCodeEditor(
            "python",
            faPython,
            `${import.meta.env.VITE_NVIDIA_NIM_APP_API_URL}/get-output`,
            samplePy
          )}
        />
        <Route
          path="/javascript"
          element={renderCodeEditor(
            "javascript",
            faJsSquare,
            `${import.meta.env.VITE_NVIDIA_NIM_APP_API_URL}/get-output`,
            sampleJs
          )}
        />
        <Route
          path="/c"
          element={renderCodeEditor(
            "c",
            faCuttlefish,
            `${import.meta.env.VITE_NVIDIA_NIM_APP_API_URL}/get-output`,
            sampleC
          )}
        />
        <Route
          path="/cpp"
          element={renderCodeEditor(
            "cpp",
            faCuttlefish,
            `${import.meta.env.VITE_NVIDIA_NIM_APP_API_URL}/get-output`,
            sampleCpp
          )}
        />
        <Route
          path="/java"
          element={renderCodeEditor(
            "java",
            faJava,
            `${import.meta.env.VITE_NVIDIA_NIM_APP_API_URL}/get-output`,
            sampleJava
          )}
        />
        <Route
          path="/csharp"
          element={renderCodeEditor(
            "csharp",
            faCuttlefish,
            `${import.meta.env.VITE_NVIDIA_NIM_APP_API_URL}/get-output`,
            sampleCsharp
          )}
        />
        <Route
          path="/rust"
          element={renderCodeEditor(
            "rust",
            faRust,
            `${import.meta.env.VITE_NVIDIA_NIM_APP_API_URL}/get-output`,
            sampleRust
          )}
        />
        <Route
          path="/go"
          element={renderCodeEditor(
            "go",
            faGolang,
            `${import.meta.env.VITE_NVIDIA_NIM_APP_API_URL}/get-output`,
            sampleGo
          )}
        />
        <Route
          path="/php"
          element={renderCodeEditor(
            "php",
            faPhp,
            `${import.meta.env.VITE_NVIDIA_NIM_APP_API_URL}/get-output`,
            samplePHP
          )}
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
        id="main-div"
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
};

export default App;
