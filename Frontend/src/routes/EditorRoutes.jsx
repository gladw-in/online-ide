import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { IoLogoPython, IoHardwareChipOutline } from "react-icons/io5";
import {
  SiJavascript,
  SiRust,
  SiMongodb,
  SiSwift,
  SiRuby,
  SiDart,
  SiPerl,
  SiScala,
  SiJulia,
} from "react-icons/si";
import { FaGolang } from "react-icons/fa6";
import { RiJavaFill } from "react-icons/ri";
import {
  PiFileCppFill,
  PiFileCSharpFill,
  PiFileCFill,
  PiFileSqlFill,
} from "react-icons/pi";
import { TbBrandKotlin } from "react-icons/tb";
import { BiLogoTypescript } from "react-icons/bi";
import sampleHtml from "../samples/index.html?raw";
import sampleCSS from "../samples/style.css?raw";
import sampleJavaScript from "../samples/script.js?raw";
import { LOCAL_STORAGE_TOKEN_KEY, GENAI_API_URL } from "../utils/constants";

const Register = lazy(() => import("../pages/Register"));
const Login = lazy(() => import("../pages/Login"));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword"));
const Accounts = lazy(() => import("../pages/Accounts"));
const NotFound = lazy(() => import("../pages/NotFound"));
const NavigationLinks = lazy(() => import("../components/NavigationLinks"));
const Editor = lazy(() => import("../components/Editor"));
const CodeEditor = lazy(() => import("../components/CodeEditor"));
const ShareEditor = lazy(() => import("../components/ShareEditor"));

const isAuthenticated = () => !!localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);

const htmlCode = {
  html: sampleHtml,
  css: sampleCSS,
  javascript: sampleJavaScript,
};

const ProtectedRoute = ({ element }) => {
  return isAuthenticated() ? element : <Navigate to="/login" />;
};

const RedirectedRoute = ({ element }) => {
  return !isAuthenticated() ? element : <Navigate to="/" />;
};

const PageLoader = () => (
  <div className="flex justify-center items-center min-h-[60vh]">
    <div className="flex items-center space-x-2">
      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-gray-600 dark:text-gray-300">Loading...</span>
    </div>
  </div>
);

const LazyRoute = ({ element }) => (
  <Suspense fallback={<PageLoader />}>{element}</Suspense>
);

const languages = [
  {
    path: "/python",
    language: "python",
    icon: IoLogoPython,
    getSample: () =>
      import("../samples/python.py?raw").then((module) => module.default),
  },
  {
    path: "/javascript",
    language: "javascript",
    icon: SiJavascript,
    getSample: () =>
      import("../samples/javascript.js?raw").then((module) => module.default),
  },
  {
    path: "/c",
    language: "c",
    icon: PiFileCFill,
    getSample: () =>
      import("../samples/c.c?raw").then((module) => module.default),
  },
  {
    path: "/cpp",
    language: "cpp",
    icon: PiFileCppFill,
    getSample: () =>
      import("../samples/cpp.cpp?raw").then((module) => module.default),
  },
  {
    path: "/java",
    language: "java",
    icon: RiJavaFill,
    getSample: () =>
      import("../samples/java.java?raw").then((module) => module.default),
  },
  {
    path: "/csharp",
    language: "csharp",
    icon: PiFileCSharpFill,
    getSample: () =>
      import("../samples/csharp.cs?raw").then((module) => module.default),
  },
  {
    path: "/rust",
    language: "rust",
    icon: SiRust,
    getSample: () =>
      import("../samples/rust.rs?raw").then((module) => module.default),
  },
  {
    path: "/go",
    language: "go",
    icon: FaGolang,
    getSample: () =>
      import("../samples/go.go?raw").then((module) => module.default),
  },
  {
    path: "/verilog",
    language: "verilog",
    icon: IoHardwareChipOutline,
    getSample: () =>
      import("../samples/verilog.v?raw").then((module) => module.default),
  },
  {
    path: "/sql",
    language: "sql",
    icon: PiFileSqlFill,
    getSample: () =>
      import("../samples/sql.sql?raw").then((module) => module.default),
  },
  {
    path: "/mongodb",
    language: "mongodb",
    icon: SiMongodb,
    getSample: () =>
      import("../samples/mongodb.js?raw").then((module) => module.default),
  },
  {
    path: "/swift",
    language: "swift",
    icon: SiSwift,
    getSample: () =>
      import("../samples/swift.swift?raw").then((module) => module.default),
  },
  {
    path: "/ruby",
    language: "ruby",
    icon: SiRuby,
    getSample: () =>
      import("../samples/ruby.rb?raw").then((module) => module.default),
  },
  {
    path: "/typescript",
    language: "typescript",
    icon: BiLogoTypescript,
    getSample: () =>
      import("../samples/typescript.ts?raw").then((module) => module.default),
  },
  {
    path: "/dart",
    language: "dart",
    icon: SiDart,
    getSample: () =>
      import("../samples/dart.dart?raw").then((module) => module.default),
  },
  {
    path: "/kotlin",
    language: "kotlin",
    icon: TbBrandKotlin,
    getSample: () =>
      import("../samples/kotlin.kt?raw").then((module) => module.default),
  },
  {
    path: "/perl",
    language: "perl",
    icon: SiPerl,
    getSample: () =>
      import("../samples/perl.pl?raw").then((module) => module.default),
  },
  {
    path: "/scala",
    language: "scala",
    icon: SiScala,
    getSample: () =>
      import("../samples/scala.scala?raw").then((module) => module.default),
  },
  {
    path: "/julia",
    language: "julia",
    icon: SiJulia,
    getSample: () =>
      import("../samples/julia.jl?raw").then((module) => module.default),
  },
];

const EditorRoutes = ({ isDarkMode }) => (
  <div className="flex-grow">
    <Routes>
      <Route
        path="/register"
        element={
          <LazyRoute
            element={<RedirectedRoute element={<Register isDarkMode />} />}
          />
        }
      />
      <Route
        path="/login"
        element={
          <LazyRoute element={<RedirectedRoute element={<Login />} />} />
        }
      />
      <Route
        path="/forgot-password"
        element={<LazyRoute element={<ForgotPassword />} />}
      />
      <Route
        path="/account/:username"
        element={
          <LazyRoute element={<ProtectedRoute element={<Accounts />} />} />
        }
      />
      <Route path="/" element={<LazyRoute element={<NavigationLinks />} />} />
      <Route
        path="/htmlcssjs"
        element={
          <LazyRoute
            element={<Editor value={htmlCode} isDarkMode={isDarkMode} />}
          />
        }
      />
      <Route
        path="/:shareId"
        element={
          <LazyRoute element={<ShareEditor isDarkMode={isDarkMode} />} />
        }
      />
      {languages.map(({ path, language, icon, getSample }) => (
        <Route
          key={language}
          path={path}
          element={
            <LazyRoute
              element={
                <CodeEditor
                  language={language}
                  reactIcon={icon}
                  apiEndpoint={`${GENAI_API_URL}/get-output`}
                  isDarkMode={isDarkMode}
                  defaultCode={getSample}
                />
              }
            />
          }
        />
      ))}
      <Route path="*" element={<LazyRoute element={<NotFound />} />} />
    </Routes>
  </div>
);

export default EditorRoutes;
