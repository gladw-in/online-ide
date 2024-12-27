import React, { useState, useEffect } from "react";
import MonacoEditor from "@monaco-editor/react";
import { useNavigate } from "react-router-dom";
import {
  FaSpinner,
  FaPlay,
  FaDownload,
  FaCopy,
  FaWrench,
} from "react-icons/fa6";
import { FaMagic, FaTrashAlt } from "react-icons/fa";
import { BiTerminal } from "react-icons/bi";
import Swal from "sweetalert2/dist/sweetalert2.js";
import "sweetalert2/src/sweetalert2.scss";

const CodeEditor = ({
  language,
  icon,
  apiEndpoint,
  isDarkMode,
  defaultCode,
}) => {
  const [code, setCode] = useState(
    sessionStorage.getItem(`${language}Code`) || defaultCode || ""
  );
  const [output, setOutput] = useState(
    sessionStorage.getItem(`${language}Output`) || ""
  );
  const [deviceType, setDeviceType] = useState("pc");
  const [cpyBtnState, setCpyBtnState] = useState("Copy");
  const [timeoutId, setTimeoutId] = useState(null);
  const [loadingActionRun, setLoadingActionRun] = useState(null);
  const [loadingActionGen, setLoadingActionGen] = useState(null);
  const [loadingActionRefactor, setLoadingActionRefactor] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isEditorReadOnly, setIsEditorReadOnly] = useState(false);

  const navigate = useNavigate();

  const fontSizeMap = {
    pc: 16,
    tablet: 14,
    mobile: 12,
  };

  document.title = `${language.charAt(0).toUpperCase()}${language.slice(
    1
  )} Editor - Online IDE`;

  useEffect(() => {
    const savedCode = sessionStorage.getItem(`${language}Code`);
    const savedOutput = sessionStorage.getItem(`${language}Output`);

    if (savedCode) {
      setCode(savedCode);
    } else {
      setCode(defaultCode || "");
    }

    if (savedOutput) {
      setOutput(savedOutput);
    }

    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }

    const handleResize = () => {
      const width = window.innerWidth;
      if (width > 1024) {
        setDeviceType("pc");
      } else if (width <= 1024 && width > 768) {
        setDeviceType("tablet");
      } else {
        setDeviceType("mobile");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [language]);

  useEffect(() => {
    if (code !== sessionStorage.getItem(`${language}Code`) || code === "") {
      sessionStorage.setItem(`${language}Code`, code);
    }

    if (
      output !== sessionStorage.getItem(`${language}Output`) ||
      output === ""
    ) {
      sessionStorage.setItem(`${language}Output`, output);
    }
  }, [code, output, language]);

  const runCode = async () => {
    if (code.length === 0) return;
    setLoadingActionRun("run");
    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: language,
          code: code,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setOutput(result.output || "No output returned.");
        if (isLoggedIn) {
          getRunCodeCount(language);
        }
      } else {
        setOutput(`Error: ${result.error}`);
      }
    } catch (error) {
      setOutput("Failed!! try again.");
    } finally {
      document
        .getElementById("terminal")
        .scrollIntoView({ behavior: "smooth", block: "start" });
      setLoadingActionRun(null);
    }
  };

  const clearAll = () => {
    setCode("");
    setOutput("");
  };

  const handleCopy = async () => {
    if (cpyBtnState === "Copying..." || code.length === 0) return;

    setCpyBtnState("Copying...");

    try {
      await navigator.clipboard.writeText(code);
      setCpyBtnState("Copied!");
    } catch (err) {
      setCpyBtnState("Error!");
    }

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const newTimeoutId = setTimeout(() => {
      setCpyBtnState("Copy");
    }, 1500);

    setTimeoutId(newTimeoutId);
  };

  const generateCodeFromPrompt = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    const { value: prompt } = await Swal.fire({
      title: "Enter",
      input: "text",
      inputLabel: "What code do you want?",
      inputPlaceholder: "e.g., simple calculator",
      showCancelButton: true,
      allowOutsideClick: false,
      inputValidator: (value) => {
        if (!value) {
          return "This field is mandatory! Please enter a prompt.";
        }
      },
    });

    if (prompt) {
      setLoadingActionGen("generate");
      try {
        setIsEditorReadOnly(true);
        const response = await fetch(
          `${import.meta.env.VITE_GEMINI_API_URL}/generate_code`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              problem_description: prompt,
              language: language,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to generate code.");
        }

        const result = await response.json();
        setCode(result.code || "No code generated.");
        getGenerateCodeCount();
      } catch (error) {
        Swal.fire("Error", "Failed to generate code.", "error");
      } finally {
        setLoadingActionGen(null);
        setIsEditorReadOnly(false);
      }
    }
  };

  const refactorCode = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    if (code.length === 0 || !language) return;

    setLoadingActionRefactor("refactor");
    try {
      setIsEditorReadOnly(true);

      const response = await fetch(
        `${import.meta.env.VITE_GEMINI_API_URL}/refactor_code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            language,
            code,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to refactor code.");
      }

      const result = await response.json();
      setCode(result.code || "No refactored code returned.");
      getRefactorCodeCount();
    } catch (error) {
      Swal.fire("Error", "Failed to refactor code.", "error");
    } finally {
      setLoadingActionRefactor(null);
      setIsEditorReadOnly(false);
    }
  };

  const getRunCodeCount = async (language) => {
    const username = localStorage.getItem("username");

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_API_URL}/api/runCode/count`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, language }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch run count");
    }
  };

  const getGenerateCodeCount = async () => {
    const username = localStorage.getItem("username");

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_API_URL}/api/generateCode/count`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          language: language,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to send request");
    }
  };

  const getRefactorCodeCount = async () => {
    const username = localStorage.getItem("username");

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_API_URL}/api/refactorCode/count`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          language: language,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to send request");
    }
  };

  const downloadFile = (content, filename, language) => {
    let mimeType;
    let fileExtension;

    switch (language) {
      case "python":
        mimeType = "text/x-python";
        fileExtension = "py";
        break;
      case "javascript":
        mimeType = "application/javascript";
        fileExtension = "js";
        break;
      case "c":
        mimeType = "text/x-c";
        fileExtension = "c";
        break;
      case "cpp":
        mimeType = "text/x-c++src";
        fileExtension = "cpp";
        break;
      case "java":
        mimeType = "text/x-java";
        fileExtension = "java";
        break;
      case "csharp":
        mimeType = "application/x-csharp";
        fileExtension = "cs";
        break;
      case "go":
        mimeType = "text/x-go";
        fileExtension = "go";
        break;
      case "rust":
        mimeType = "text/x-rust";
        fileExtension = "rs";
        break;
      case "shell":
        mimeType = "application/x-sh";
        fileExtension = "sh";
        break;
      case "sql":
        mimeType = "application/sql";
        fileExtension = "sql";
        break;
      case "mongodb":
        mimeType = "application/javascript";
        fileExtension = "js";
        break;
      case "swift":
        mimeType = "application/x-swift";
        fileExtension = "swift";
        break;
      case "ruby":
        mimeType = "text/x-ruby";
        fileExtension = "rb";
        break;
      case "typescript":
        mimeType = "application/typescript";
        fileExtension = "ts";
        break;
      case "dart":
        mimeType = "application/dart";
        fileExtension = "dart";
        break;
      case "kotlin":
        mimeType = "application/x-java";
        fileExtension = "kt";
        break;
      case "perl":
        mimeType = "application/x-perl";
        fileExtension = "pl";
        break;
      case "scala":
        mimeType = "application/scala";
        fileExtension = "scala";
        break;
      case "julia":
        mimeType = "application/x-julia";
        fileExtension = "jl";
        break;
      default:
        mimeType = "application/octet-stream";
        fileExtension = "txt";
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const buttonsConfig = [
    {
      action: runCode,
      bgColor: "bg-blue-500",
      icon:
        loadingActionRun === "run" ? (
          <FaSpinner className="mr-2 mt-1 animate-spin" />
        ) : (
          <FaPlay className="mr-2 mt-1" />
        ),
      text: loadingActionRun === "run" ? "Running..." : "Run",
      disabled: loadingActionRun === "run",
    },
    {
      action: clearAll,
      bgColor: "bg-red-500",
      icon: <FaTrashAlt className="mr-2 mt-1" />,
      text: "Clear All",
      disabled: false,
    },
    {
      action: handleCopy,
      bgColor: "bg-purple-500",
      icon: <FaCopy className="mr-2 mt-1" />,
      text: cpyBtnState,
      disabled: cpyBtnState === "Copying...",
    },
    {
      action: () => downloadFile(code, "file", language),
      bgColor: "bg-orange-500",
      icon: <FaDownload className="mr-2 mt-1" />,
      text: "Download",
      disabled: code.length === 0,
    },
    {
      action: generateCodeFromPrompt,
      bgColor: "bg-green-500",
      icon:
        loadingActionGen === "generate" ? (
          <FaSpinner className="mr-2 mt-1 animate-spin" />
        ) : (
          <FaMagic className="mr-2 mt-1" />
        ),
      text: loadingActionGen === "generate" ? "Generating..." : "Generate",
      disabled: loadingActionGen === "generate",
    },
    {
      action: refactorCode,
      bgColor: "bg-yellow-500",
      icon:
        loadingActionRefactor === "refactor" ? (
          <FaSpinner className="mr-2 mt-1 animate-spin" />
        ) : (
          <FaWrench className="mr-2 mt-1" />
        ),
      text:
        loadingActionRefactor === "refactor" ? "Refactoring..." : "Refactor",
      disabled: code.length === 0,
    },
  ];

  const RenderOutput = () => (
    <>
      <div className="mt-4">
        <div
          className="dark:bg-gray-800 dark:border-gray-700 bg-gray-300 rounded-t-lg p-2"
          id="terminal"
        >
          <div className="flex items-center space-x-2">
            <BiTerminal className="ml-2 text-2xl" />
            <h2 className="text-xl">Output</h2>
          </div>
        </div>

        <pre className="select-text font-mono text-xs font-semibold lg:text-sm max-h-[295px] overflow-auto p-3 rounded-b-lg [scrollbar-width:thin] bg-[#eaeaea] text-[#292929] dark:bg-[#262636] dark:text-[#24a944]">
          {output.replaceAll(/```[\w\s]+/g, "")}
        </pre>
      </div>
      <p className="ml-2 text-sm text-gray-500 italic">
        Output may not be accurate.
      </p>
    </>
  );

  return (
    <div className="mx-auto p-4">
      <div className="dark:bg-gray-800 dark:border-gray-700 bg-gray-300 rounded-lg">
        <div className="flex items-center my-2 ml-3 pt-2">
          {icon && React.createElement(icon, { className: "text-xl mr-2" })}
          <h2 className="text-xl">
            {language.charAt(0).toUpperCase() + language.slice(1)} Editor
          </h2>
        </div>
        <MonacoEditor
          language={language === "mongodb" ? "javascript" : language}
          value={code}
          onChange={(newValue) => setCode(newValue)}
          editorDidMount={(editor) => editor.focus()}
          height="350px"
          theme={isDarkMode ? "vs-dark" : "vs-light"}
          options={{
            minimap: { enabled: false },
            matchBrackets: "always",
            fontFamily: "Source Code Pro",
            renderValidationDecorations: "on",
            scrollbar: { vertical: "visible", horizontal: "visible" },
            fontWeight: "bold",
            formatOnPaste: true,
            semanticHighlighting: true,
            folding: !deviceType.includes("mobile"),
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: true,
            cursorStyle: "line",
            fontSize: fontSizeMap[deviceType],
            readOnly: isEditorReadOnly,
          }}
        />
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-4">
        {buttonsConfig.map((button, index) => (
          <button
            key={index}
            onClick={button.action}
            className={`px-6 py-2 ${button.bgColor} text-white inline-flex place-content-center rounded-md w-full sm:w-auto md:hover:scale-105 transition-transform duration-200`}
            disabled={button.disabled}
          >
            {button.icon}
            {button.text}
          </button>
        ))}
      </div>
      <RenderOutput />
    </div>
  );
};

export default CodeEditor;
