import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { IoLogoPython } from "react-icons/io5";
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
import { VscTerminalBash } from "react-icons/vsc";
import { TbBrandKotlin } from "react-icons/tb";
import { BiLogoTypescript } from "react-icons/bi";
import Register from "./Register";
import Login from "./Login";
import Accounts from "./Accounts";
import NotFound from "./NotFound";
import NavigationLinks from "./NavigationLinks";
import Editor from "./Editor";
import CodeEditor from "./CodeEditor";
import ShareEditor from "./ShareEditor";
import samplePy from "./samples/python.py?raw";
import sampleJs from "./samples/javascript.js?raw";
import sampleC from "./samples/c.c?raw";
import sampleCpp from "./samples/cpp.cpp?raw";
import sampleJava from "./samples/java.java?raw";
import sampleCsharp from "./samples/csharp.cs?raw";
import sampleRust from "./samples/rust.rs?raw";
import sampleGo from "./samples/go.go?raw";
import sampleBash from "./samples/bash.sh?raw";
import sampleSQL from "./samples/sql.sql?raw";
import sampleMongoDB from "./samples/mongodb.js?raw";
import sampleSwift from "./samples/swift.swift?raw";
import sampleRuby from "./samples/ruby.rb?raw";
import sampleTypeScript from "./samples/typescript.ts?raw";
import sampleDart from "./samples/dart.dart?raw";
import sampleKotlin from "./samples/kotlin.kt?raw";
import samplePerl from "./samples/perl.pl?raw";
import sampleScala from "./samples/scala.scala?raw";
import sampleJulia from "./samples/julia.jl?raw";
import sampleHtml from "./samples/index.html?raw";
import sampleCSS from "./samples/style.css?raw";
import sampleJavaScript from "./samples/script.js?raw";

const isAuthenticated = () => !!localStorage.getItem("token");

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

const languages = [
  {
    path: "/python",
    language: "python",
    icon: IoLogoPython,
    sampleCode: samplePy,
  },
  {
    path: "/javascript",
    language: "javascript",
    icon: SiJavascript,
    sampleCode: sampleJs,
  },
  {
    path: "/c",
    language: "c",
    icon: PiFileCFill,
    sampleCode: sampleC,
  },
  {
    path: "/cpp",
    language: "cpp",
    icon: PiFileCppFill,
    sampleCode: sampleCpp,
  },
  {
    path: "/java",
    language: "java",
    icon: RiJavaFill,
    sampleCode: sampleJava,
  },
  {
    path: "/csharp",
    language: "csharp",
    icon: PiFileCSharpFill,
    sampleCode: sampleCsharp,
  },
  {
    path: "/rust",
    language: "rust",
    icon: SiRust,
    sampleCode: sampleRust,
  },
  {
    path: "/go",
    language: "go",
    icon: FaGolang,
    sampleCode: sampleGo,
  },
  {
    path: "/shell",
    language: "shell",
    icon: VscTerminalBash,
    sampleCode: sampleBash,
  },
  {
    path: "/sql",
    language: "sql",
    icon: PiFileSqlFill,
    sampleCode: sampleSQL,
  },
  {
    path: "/mongodb",
    language: "mongodb",
    icon: SiMongodb,
    sampleCode: sampleMongoDB,
  },
  {
    path: "/swift",
    language: "swift",
    icon: SiSwift,
    sampleCode: sampleSwift,
  },
  {
    path: "/ruby",
    language: "ruby",
    icon: SiRuby,
    sampleCode: sampleRuby,
  },
  {
    path: "/typescript",
    language: "typescript",
    icon: BiLogoTypescript,
    sampleCode: sampleTypeScript,
  },
  {
    path: "/dart",
    language: "dart",
    icon: SiDart,
    sampleCode: sampleDart,
  },
  {
    path: "/kotlin",
    language: "kotlin",
    icon: TbBrandKotlin,
    sampleCode: sampleKotlin,
  },
  {
    path: "/perl",
    language: "perl",
    icon: SiPerl,
    sampleCode: samplePerl,
  },
  {
    path: "/scala",
    language: "scala",
    icon: SiScala,
    sampleCode: sampleScala,
  },
  {
    path: "/julia",
    language: "julia",
    icon: SiJulia,
    sampleCode: sampleJulia,
  },
];

const EditorRoutes = ({ isDarkMode }) => (
  <div className="flex-grow">
    <Routes>
      <Route
        path="/register"
        element={<RedirectedRoute element={<Register isDarkMode />} />}
      />

      <Route path="/login" element={<RedirectedRoute element={<Login />} />} />

      <Route
        path="/accounts"
        element={<ProtectedRoute element={<Accounts />} />}
      />

      <Route path="/" element={<NavigationLinks />} />

      <Route
        path="/htmlcssjs"
        element={<Editor value={htmlCode} isDarkMode={isDarkMode} />}
      />

      <Route
        path="/:shareId"
        element={<ShareEditor isDarkMode={isDarkMode} />}
      />

      {languages.map(({ path, language, icon, sampleCode }) => (
        <Route
          key={language}
          path={path}
          element={
            <CodeEditor
              language={language}
              reactIcon={icon}
              apiEndpoint={`${import.meta.env.VITE_GEMINI_API_URL}/get-output`}
              isDarkMode={isDarkMode}
              defaultCode={sampleCode}
            />
          }
        />
      ))}

      <Route path="*" element={<NotFound />} />
    </Routes>
  </div>
);

export default EditorRoutes;
