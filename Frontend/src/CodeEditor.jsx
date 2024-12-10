import React, { useState, useEffect } from "react";
import MonacoEditor from "@monaco-editor/react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrashAlt,
  faPlay,
  faSpinner,
  faDownload,
  faMagic,
  faWrench,
  faCopy,
} from "@fortawesome/free-solid-svg-icons";
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
  const [loadingAction, setLoadingAction] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isEditorReadOnly, setIsEditorReadOnly] = useState(false);
  const [isCleared, setIsCleared] = useState(false);

  const navigate = useNavigate();

  const fontSizeMap = {
    pc: 16,
    tablet: 14,
    mobile: 12,
  };

  document.title = `${language.charAt(0).toUpperCase()}${language.slice(
    1
  )} Editor`;

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
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    if (code.length === 0) return;
    setLoadingAction("run");
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
        console.error("Error:", result.error);
        setOutput(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Request failed:", error);
      setOutput("Request failed.");
    } finally {
      setLoadingAction(null);
      setIsCleared(false);
    }
  };

  const clearAll = () => {
    setCode("");
    setOutput("");
    setIsCleared(true);
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
      case "php":
        mimeType = "application/x-httpd-php";
        fileExtension = "php";
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
    });

    if (prompt) {
      setLoadingAction("generate");
      try {
        setIsEditorReadOnly(true);
        const response = await fetch(
          `${import.meta.env.VITE_NVIDIA_NIM_APP_API_URL}/generate-code`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              language,
              prompt,
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
        setLoadingAction(null);
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

    setLoadingAction("refactor");
    try {
      setIsEditorReadOnly(true);

      const response = await fetch(
        `${import.meta.env.VITE_NVIDIA_NIM_APP_API_URL}/refactor`,
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
      setLoadingAction(null);
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

  const renderOutput = () =>
    isLoggedIn && (
      <div className="mt-4">
        <h2 className="text-xl mb-2">Output</h2>
        <pre
          className={`select-text font-mono text-xs font-semibold lg:text-sm max-h-[295px] overflow-auto p-3 rounded [scrollbar-width:thin] bg-[#eaeaea] text-[#292929] dark:bg-[#262636] dark:text-[#24a944] ${
            isCleared ? "hidden" : ""
          }`}
        >
          {output}
        </pre>
      </div>
    );

  return (
    <div className="mx-auto p-4">
      <div className="dark:bg-gray-800 dark:border-gray-700 bg-gray-200 rounded-lg">
        <div className="flex items-center my-2 ml-3 pt-2">
          <h2 className="text-xl">
            <FontAwesomeIcon icon={icon} className="mr-2" />
            {language.charAt(0).toUpperCase() + language.slice(1)} Editor
          </h2>
        </div>
        <MonacoEditor
          language={language}
          value={code}
          onChange={(newValue) => setCode(newValue)}
          editorDidMount={(editor) => editor.focus()}
          height="400px"
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
        <button
          onClick={runCode}
          className="px-6 py-2 bg-blue-500 text-white rounded-md w-full sm:w-auto"
          disabled={loadingAction === "run"}
        >
          {loadingAction === "run" ? (
            <FontAwesomeIcon icon={faSpinner} className="mr-2 animate-spin" />
          ) : (
            <FontAwesomeIcon icon={faPlay} className="mr-2" />
          )}
          {loadingAction === "run" ? "Running..." : "Run"}
        </button>
        <button
          onClick={clearAll}
          className="px-6 py-2 bg-red-500 text-white rounded-md w-full sm:w-auto"
        >
          <FontAwesomeIcon icon={faTrashAlt} className="mr-2" />
          Clear All
        </button>
        <button
          onClick={handleCopy}
          className={`px-6 py-2 bg-purple-500 text-white rounded-md w-full sm:w-auto transition-all duration-300 ${
            cpyBtnState === "Copying..." ? "opacity-80" : ""
          }`}
          disabled={cpyBtnState === "Copying..."}
        >
          <FontAwesomeIcon icon={faCopy} className="mr-2" />
          {cpyBtnState}
        </button>
        <button
          onClick={() => downloadFile(code, "code", language)}
          className="px-6 py-2 bg-orange-500 text-white rounded-md w-full sm:w-auto"
          disabled={code.length === 0}
        >
          <FontAwesomeIcon icon={faDownload} className="mr-2" />
          Download
        </button>
        <button
          onClick={generateCodeFromPrompt}
          className="px-6 py-2 bg-green-500 text-white rounded-md w-full sm:w-auto"
          disabled={loadingAction === "generate"}
        >
          {loadingAction === "generate" ? (
            <FontAwesomeIcon icon={faSpinner} className="mr-2 animate-spin" />
          ) : (
            <FontAwesomeIcon icon={faMagic} className="mr-2" />
          )}
          {loadingAction === "generate" ? "Generating..." : "Generate"}
        </button>
        <button
          onClick={refactorCode}
          className="px-6 py-2 bg-yellow-500 text-white rounded-md w-full sm:w-auto"
          disabled={loadingAction === "refactor"}
        >
          {loadingAction === "refactor" ? (
            <FontAwesomeIcon icon={faSpinner} className="mr-2 animate-spin" />
          ) : (
            <FontAwesomeIcon icon={faWrench} className="mr-2" />
          )}
          {loadingAction === "refactor" ? "Refactoring..." : "Refactor"}
        </button>
      </div>
      {renderOutput()}
    </div>
  );
};

export default CodeEditor;
