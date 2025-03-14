import React, { useState, useEffect, useRef } from "react";
import MonacoEditor from "@monaco-editor/react";
import ShareLinkModal from "../utils/ShareLinkModal.js";
import {
  SESSION_STORAGE_SHARELINKS_KEY,
  LOCAL_STORAGE_TOKEN_KEY,
  LOCAL_STORAGE_USERNAME_KEY,
  GENAI_API_URL,
  TEMP_SHARE_API_URL,
  BACKEND_API_URL,
} from "../utils/constants";
import { useNavigate } from "react-router-dom";
import {
  FaSpinner,
  FaPlay,
  FaDownload,
  FaCopy,
  FaWrench,
} from "react-icons/fa6";
import { FaMagic, FaTrashAlt, FaShare } from "react-icons/fa";
import { BiTerminal } from "react-icons/bi";
import Swal from "sweetalert2/dist/sweetalert2.js";

const CodeEditor = ({
  title,
  language,
  reactIcon,
  apiEndpoint,
  isDarkMode,
  defaultCode,
  shareIdData,
}) => {
  const codeStorageKey = `__${shareIdData || language}Code__`;
  const outputStorageKey = `__${shareIdData || language}Output__`;

  const [code, setCode] = useState(
    sessionStorage.getItem(codeStorageKey) || defaultCode || ""
  );
  const [output, setOutput] = useState(
    sessionStorage.getItem(outputStorageKey) || ""
  );
  const [deviceType, setDeviceType] = useState("pc");
  const [cpyBtnState, setCpyBtnState] = useState("Copy");
  const [timeoutId, setTimeoutId] = useState(null);
  const [loadingActionRun, setLoadingActionRun] = useState(null);
  const [loadingActionGen, setLoadingActionGen] = useState(null);
  const [loadingActionRefactor, setLoadingActionRefactor] = useState(null);
  const [isGenerateBtnPressed, setisGenerateBtnPressed] = useState(false);
  const [isRefactorBtnPressed, setisRefactorBtnPressed] = useState(false);
  const [isDownloadBtnPressed, setisDownloadBtnPressed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isEditorReadOnly, setIsEditorReadOnly] = useState(false);

  const terminalRef = useRef(null);
  const editorRef = useRef(null);

  const navigate = useNavigate();

  const fontSizeMap = {
    pc: 16,
    tablet: 14,
    mobile: 12,
  };

  useEffect(() => {
    const capitalizeFirstLetter = (str) => {
      if (!str) return "";
      return str.charAt(0).toUpperCase() + str.slice(1);
    };

    const formattedTitle = title
      ? title.length > 30
        ? `${capitalizeFirstLetter(title.slice(0, 30))}...${title.slice(-3)}`
        : capitalizeFirstLetter(title)
      : "";

    const formattedLanguage = capitalizeFirstLetter(language);

    const pageTitle = formattedTitle
      ? `${formattedTitle} - ${formattedLanguage}`
      : formattedLanguage;

    document.title = `${pageTitle} Editor - Online IDE`;
  }, [title, language]);

  useEffect(() => {
    const savedCode = sessionStorage.getItem(codeStorageKey);
    const savedOutput = sessionStorage.getItem(outputStorageKey);

    if (savedCode) {
      setCode(savedCode);
    } else {
      setCode(defaultCode || "");
    }

    if (savedOutput) {
      setOutput(savedOutput);
    }

    const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
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
    if (code !== sessionStorage.getItem(codeStorageKey) || code === "") {
      sessionStorage.setItem(codeStorageKey, code);
    }

    if (output !== sessionStorage.getItem(outputStorageKey) || output === "") {
      sessionStorage.setItem(outputStorageKey, output);
    }
  }, [code, output, language]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  const runCode = async () => {
    if (code.length === 0) return;
    setLoadingActionRun("run");
    try {
      setisDownloadBtnPressed(true);

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
          await getRunCodeCount(language);
        }
      } else {
        setOutput(`Error: ${result.error}`);
      }
    } catch (error) {
      setOutput("Failed!! try again.");
    } finally {
      terminalRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setLoadingActionRun(null);
      setisDownloadBtnPressed(false);
    }
  };

  const clearAll = () => {
    setCode("");
    setOutput("");
  };

  const handleCopy = async () => {
    const content = sessionStorage.getItem(codeStorageKey);

    if (cpyBtnState === "Copying..." || content.length === 0) return;

    setCpyBtnState("Copying...");

    try {
      await navigator.clipboard.writeText(content);

      const lastLineNumber = editorRef.current.getModel().getLineCount();
      editorRef.current.revealLine(lastLineNumber);
      editorRef.current.setSelection({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: lastLineNumber,
        endColumn: editorRef.current
          .getModel()
          .getLineMaxColumn(lastLineNumber),
      });

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
      title: "Generate Code",
      input: "textarea",
      inputLabel: "What code do you want?",
      inputPlaceholder: "e.g., simple calculator",
      showCancelButton: true,
      allowOutsideClick: false,
      footer: `<p class="text-center text-sm text-red-500 dark:text-red-300">Refactor the code if the <span class="font-bold">generated code</span> is not functioning properly.</p>`,
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
        setisGenerateBtnPressed(true);

        const response = await fetch(`${GENAI_API_URL}/generate_code`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            problem_description: prompt,
            language: language,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate code.");
        }

        const result = await response.json();
        setCode(result.code || "No code generated.");

        await getGenerateCodeCount();
      } catch (error) {
        Swal.fire("Error", "Failed to generate code.", "error");
      } finally {
        editorRef.current.revealLine(1);

        setLoadingActionGen(null);
        setIsEditorReadOnly(false);
        setisGenerateBtnPressed(false);
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
      setisRefactorBtnPressed(true);

      const response = await fetch(`${GENAI_API_URL}/refactor_code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language,
          code,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to refactor code.");
      }

      const result = await response.json();
      setCode(result.code || "No refactored code returned.");

      await getRefactorCodeCount();
    } catch (error) {
      Swal.fire("Error", "Failed to refactor code.", "error");
    } finally {
      setLoadingActionRefactor(null);
      setIsEditorReadOnly(false);
      setisRefactorBtnPressed(false);
    }
  };

  const shareLink = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    if (!code || !language) {
      Swal.fire({
        icon: "error",
        title: "Missing Information",
        text: "Please provide both code and language before uploading.",
      });
      return;
    }

    const defaultTitle = `${language}-untitled-${Math.random()
      .toString(36)
      .substring(2, 7)}`;

    const { isDismissed } = await Swal.fire({
      title: "Create Share link",
      html: ShareLinkModal(defaultTitle),
      showCancelButton: true,
      allowOutsideClick: false,
      footer: `<p class="text-center text-sm text-red-500 dark:text-red-300">You can delete shared links at any time from <span class="font-bold">Homepage</span>.</p>`,
    });

    if (isDismissed) {
      return;
    }

    const title = document.getElementById("titleInput").value;
    const expiryTime =
      parseInt(
        document.querySelector('input[name="expiryTime"]:checked').value
      ) || 10;

    const finalTitle = title.slice(0, 60) || defaultTitle;

    Swal.fire({
      title: "Generating...",
      text: "Please wait while your Share Link is being generated.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const load = JSON.stringify({
        language,
        code,
        title: finalTitle,
        expiryTime,
      });

      const response = await fetch(`${TEMP_SHARE_API_URL}/temp-file-upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: load,
      });

      if (!response.ok) {
        throw new Error("Failed to upload the code");
      }

      const data = await response.json();

      if (response.ok) {
        if (data?.fileUrl) {
          const url = new URL(data.fileUrl);
          const shareId = url.pathname.split("/").pop();
          const shareableLink = `${window.location.origin}/${shareId}`;

          if (isLoggedIn) {
            try {
              await saveSharedLinkCount(shareId, finalTitle, expiryTime);
            } catch (err) {
              console.error(err);
            }
          }

          Swal.close();

          sessionStorage.removeItem(SESSION_STORAGE_SHARELINKS_KEY);

          Swal.fire({
            icon: "success",
            title: "Share Link is generated",
            html: `<p class="mb-2">Your code is accessible at:</p><pre class="bg-gray-100 dark:bg-neutral-800 text-neutral-800 dark:text-white p-2 rounded text-sm overflow-x-auto select-text whitespace-pre-wrap break-words">${shareableLink}</pre>`,
            confirmButtonText: "Copy",
            showCancelButton: true,
            cancelButtonText: "Close",
            showDenyButton: true,
            denyButtonText: "Open",
            allowOutsideClick: false,
            footer: `<p class="text-center text-sm text-red-500 dark:text-red-300">You can delete shared links at any time from <span class="font-bold">Homepage</span>.</p>`,
          }).then(async (result) => {
            if (result.isConfirmed) {
              await navigator.clipboard.writeText(shareableLink);
              Swal.fire("URL Copied!", "", "success");
            } else if (result.isDenied) {
              window.open(shareableLink, "_blank");
            }
          });
        }
      }
    } catch (err) {
      Swal.close();
      console.error(err);
    }
  };

  const getRunCodeCount = async (language) => {
    const username = localStorage.getItem(LOCAL_STORAGE_USERNAME_KEY);

    const response = await fetch(`${BACKEND_API_URL}/api/runCode/count`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, language }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch run count");
    }
  };

  const getGenerateCodeCount = async () => {
    const username = localStorage.getItem(LOCAL_STORAGE_USERNAME_KEY);

    const response = await fetch(`${BACKEND_API_URL}/api/generateCode/count`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        language: language,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send request");
    }
  };

  const getRefactorCodeCount = async () => {
    const username = localStorage.getItem(LOCAL_STORAGE_USERNAME_KEY);

    const response = await fetch(`${BACKEND_API_URL}/api/refactorCode/count`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        language: language,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send request");
    }
  };

  const saveSharedLinkCount = async (shareId, title, expiryTime) => {
    try {
      const username = localStorage.getItem(LOCAL_STORAGE_USERNAME_KEY);

      if (!username) {
        throw new Error(
          "Username not found in localStorage. User might not be logged in."
        );
      }

      const countResponse = await fetch(
        `${BACKEND_API_URL}/api/sharedLink/count`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            shareId,
            title,
            expiryTime,
          }),
        }
      );

      if (!countResponse.ok) {
        const errorResponse = await countResponse.json();
        throw new Error(
          `Failed to save shared link count: ${
            errorResponse.msg || countResponse.statusText
          }`
        );
      }
    } catch (err) {
      throw err;
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

  const handleCtrlS = (event) => {
    if (
      (event.ctrlKey || event.metaKey) &&
      event.key === "s" &&
      code.length !== 0
    ) {
      event.preventDefault();
      downloadFile(code, "file", language);
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleCtrlS);
    return () => {
      document.removeEventListener("keydown", handleCtrlS);
    };
  }, [code, language]);

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
      disabled: isDownloadBtnPressed || isRefactorBtnPressed,
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
      disabled:
        code.length === 0 || isDownloadBtnPressed || isGenerateBtnPressed,
    },
    {
      action: shareLink,
      bgColor: "bg-fuchsia-500",
      icon: <FaShare className="mr-2 mt-1" />,
      text: "Share",
      disabled: code.length === 0,
    },
  ];

  const RenderOutput = () => (
    <>
      <div className="mt-4" ref={terminalRef}>
        <div className="dark:bg-gray-800 dark:border-gray-700 bg-gray-300 rounded-t-lg p-2">
          <div className="flex items-center space-x-2">
            <BiTerminal className="ml-2 text-2xl" />
            <h2 className="text-xl">Output</h2>
          </div>
        </div>

        <pre className="select-text font-mono text-xs font-semibold lg:text-sm  min-h-20 max-h-[295px] overflow-auto p-3 rounded-b-lg [scrollbar-width:thin] bg-[#eaeaea] text-[#292929] dark:bg-[#262636] dark:text-[#24a944]">
          {output
            .replace(/^```(text|javascript)[\r\n]*/m, "")
            .replace(/^```[\r\n]*/m, "")
            .replace(/[\r\n]*```$/m, "") ||
            "Run your code to see output here..."}
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
          {reactIcon &&
            React.createElement(reactIcon, { className: "text-xl mr-2" })}
          <h2 className="text-xl">
            {language.charAt(0).toUpperCase() + language.slice(1)} Editor
          </h2>
        </div>
        <MonacoEditor
          language={language === "mongodb" ? "javascript" : language}
          value={code}
          onChange={(newValue) => setCode(newValue)}
          editorDidMount={(editor) => editor.focus()}
          onMount={handleEditorDidMount}
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
            scrollBeyondLastLine: false,
          }}
        />
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-4">
        {buttonsConfig.map(
          ({ action, bgColor, icon, text, disabled }, index) => (
            <button
              key={index}
              onClick={action}
              className={`px-6 py-2 ${bgColor} text-white inline-flex place-content-center rounded-md w-full cursor-pointer transition-transform duration-200 sm:w-auto md:hover:scale-105 focus:outline-none`}
              disabled={disabled}
            >
              {icon}
              {text}
            </button>
          )
        )}
      </div>
      <RenderOutput />
    </div>
  );
};

export default CodeEditor;
