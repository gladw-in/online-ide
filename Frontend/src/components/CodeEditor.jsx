import React, { useState, useEffect, useRef } from "react";
import MonacoEditor from "@monaco-editor/react";
import ShareLinkModal from "../utils/ShareLinkModal.js";
import { apiFetch } from "../utils/apifetch";
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
import { GiBrain } from "react-icons/gi";
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
    sessionStorage.getItem(outputStorageKey) ||
      "Run your code to see output here..."
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

  const capFirst = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  useEffect(() => {
    const formattedTitle = title
      ? title.length > 30
        ? `${capFirst(title.slice(0, 30))}...${title.slice(-3)}`
        : capFirst(title)
      : "";

    const formattedLanguage = capFirst(language);

    const pageTitle = formattedTitle
      ? `${formattedTitle} - ${formattedLanguage}`
      : formattedLanguage;

    document.title = `${pageTitle} Editor - Online IDE`;
  }, [title, language]);

  useEffect(() => {
    const savedCode = sessionStorage.getItem(codeStorageKey);
    const savedOutput = sessionStorage.getItem(outputStorageKey);

    if (savedCode && savedCode.trim().length !== 0) {
      setCode(savedCode);
    } else {
      setCode(defaultCode || "");
    }

    if (
      savedOutput &&
      savedOutput
        .replace(
          /^```(text|json|c|cpp|csharp|dart|go|java|javascript|julia|kotlin|mongodb|perl|python|ruby|rust|scala|sql|swift|typescript|verilog)[\r\n]*/m,
          ""
        )
        .replace(/^```[\r\n]*/m, "")
        .replace(/[\r\n]*```$/m, "")
        .trim().length !== 0
    ) {
      setOutput(savedOutput);
    } else {
      setOutput("Run your code to see output here...");
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
    if (code.trim().length === 0) return;

    setIsEditorReadOnly(true);
    setLoadingActionRun("run");
    setisDownloadBtnPressed(true);

    try {
      const response = await apiFetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: language,
          code: code,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to run code.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let isFirstChunk = true;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        if (isFirstChunk) {
          setOutput("");

          if (terminalRef.current) {
            terminalRef.current.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }

          isFirstChunk = false;
        }

        setOutput((prev) => {
          const updatedOutput = prev + chunk;

          setTimeout(() => {
            requestAnimationFrame(() => {
              if (terminalRef.current) {
                terminalRef.current.scrollTop =
                  terminalRef.current.scrollHeight;
              }
            });
          }, 0);

          return updatedOutput;
        });
      }

      if (output.length !== 0) {
        const now = new Date();
        const timeString = now.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        });

        const dateString = now.toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "2-digit",
        });

        const completedMsg = `\n\n--- Completed @ ${timeString} on ${dateString} ---`;

        setOutput((prev) => prev + completedMsg);
      }

      if (isLoggedIn) {
        await getRunCodeCount(language);
      }
    } catch (error) {
      setOutput("Failed!! Try again.");
    } finally {
      if (terminalRef.current) {
        setTimeout(() => {
          requestAnimationFrame(() => {
            if (terminalRef.current) {
              terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
            }
          });
        }, 0);
      }

      setIsEditorReadOnly(false);
      setLoadingActionRun(null);
      setisDownloadBtnPressed(false);
    }
  };

  const clearAll = () => {
    setCode("");
    setOutput("Run your code to see output here...");
  };

  const handleCopy = async () => {
    const content = sessionStorage.getItem(codeStorageKey);

    if (content.length === 0) return;

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
      Swal.fire({
        title: "Failed to copy",
        text: `Could not copy the ${language} code to clipboard.`,
        icon: "error",
      });
    }

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const newTimeoutId = setTimeout(() => {
      setCpyBtnState("Copy");
    }, 1500);

    setTimeoutId(newTimeoutId);
  };

  const generateCodeMain = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    if (!language) return;

    const { value: prompt } = await Swal.fire({
      title: "Generate Code",
      input: "textarea",
      inputLabel: "What code do you want?",
      inputPlaceholder: "e.g., simple calculator",
      confirmButtonText: "Generate",
      showCancelButton: true,
      allowOutsideClick: false,
      footer: `<p class="text-center text-sm text-red-500 dark:text-red-300">Refactor the code if the <span class="font-bold">generated code</span> is not functioning properly.</p>`,
      inputValidator: (value) => {
        if (!value) {
          return "This field is mandatory! Please enter a prompt.";
        }
      },
      didOpen: () => {
        const modal = Swal.getPopup();
        modal.addEventListener("keydown", (e) => {
          if (e.key === "Enter" && e.ctrlKey) {
            e.preventDefault();
            Swal.clickConfirm();
          }
        });
      },
    });

    if (!prompt) return;

    setLoadingActionGen("thinking");
    setIsEditorReadOnly(true);
    setisGenerateBtnPressed(true);

    try {
      const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
      if (!token) throw new Error("Authentication token missing.");

      const response = await apiFetch(`${GENAI_API_URL}/generate_code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          problem_description: prompt,
          language: language,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to generate code.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let generatedCode = "";
      let isPrevCode = false;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        if (!isPrevCode) {
          setLoadingActionGen("generate");
          setCode("");
          isPrevCode = true;
        }

        const chunk = decoder.decode(value, { stream: true });
        generatedCode += chunk;
        setCode((prev) => {
          const updatedCode = prev + chunk;

          setTimeout(() => {
            const editor = editorRef.current;
            const model = editor?.getModel();
            const lineCount = model?.getLineCount?.();

            if (lineCount) {
              editor.revealLineInCenter(lineCount);
            }
          }, 0);

          return updatedCode;
        });
      }

      if (!generatedCode.trim()) {
        Swal.fire({
          icon: "warning",
          text: "No code was generated. Please try again.",
          timer: 5000,
        });
      }

      if (isLoggedIn) {
        await getGenerateCodeCount();
      }
    } catch (error) {
      Swal.fire("Error", "Failed to generate code.", "error");
    } finally {
      setLoadingActionGen(null);
      setIsEditorReadOnly(false);
      setisGenerateBtnPressed(false);
    }
  };

  const refactorCode = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    if (code.trim().length === 0 || !language) return;

    const { value: prompt, isConfirmed } = await Swal.fire({
      title: "Refactor Code",
      input: "textarea",
      inputLabel: "Suggestions to improve the code (optional)",
      inputPlaceholder: "e.g., remove comments, optimize loop, etc.",
      confirmButtonText: "Refactor",
      showCancelButton: true,
      allowOutsideClick: false,
      footer:
        '<p class="text-center text-sm text-red-500 dark:text-red-300">Suggestions help improve results, <span class="font-bold">but are optional</span>.</p>',
      didOpen: () => {
        const modal = Swal.getPopup();
        modal.addEventListener("keydown", (e) => {
          if (e.key === "Enter" && e.ctrlKey) {
            e.preventDefault();
            Swal.clickConfirm();
          }
        });
      },
    });

    if (!isConfirmed) {
      return;
    }

    setLoadingActionRefactor("thinking");

    try {
      setIsEditorReadOnly(true);
      setisRefactorBtnPressed(true);

      const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);

      if (!token) {
        return;
      }

      const response = await apiFetch(`${GENAI_API_URL}/refactor_code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          problem_description: prompt.trim() || null,
          language,
          code,
          output,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to refactor code.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let refactorCode = "";
      let isPrevCode = false;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        if (!isPrevCode) {
          setCode("");
          setLoadingActionRefactor("refactor");
          isPrevCode = true;
        }

        const chunk = decoder.decode(value, { stream: true });
        refactorCode += chunk;

        setCode((prev) => {
          const updatedCode = prev + chunk;

          setTimeout(() => {
            const editor = editorRef.current;
            const model = editor?.getModel();
            const lineCount = model?.getLineCount?.();

            if (lineCount) {
              editor.revealLineInCenter(lineCount);
            }
          }, 0);

          return updatedCode;
        });
      }

      if (!refactorCode.trim()) {
        Swal.fire({
          icon: "warning",
          text: "No code was refactored. Please try again.",
          timer: 5000,
        });
      }
      if (isLoggedIn) {
        await getRefactorCodeCount();
      }
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
      html: ShareLinkModal(
        defaultTitle.charAt(0).toUpperCase() + defaultTitle.slice(1)
      ),
      showCancelButton: true,
      allowOutsideClick: false,
      footer: `<p class="text-center text-sm text-red-500 dark:text-red-300">You can delete shared links at any time from <span class="font-bold">Homepage</span>.</p>`,
      didOpen: () => {
        const modal = Swal.getPopup();
        modal.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            Swal.clickConfirm();
          }
        });
      },
    });

    if (isDismissed) {
      return;
    }

    const title = document.getElementById("titleInput").value;
    const expiryTime =
      parseInt(
        document.querySelector('input[name="expiryTime"]:checked').value
      ) || 10;

    const finalTitle =
      title.slice(0, 60) ||
      defaultTitle.charAt(0).toUpperCase() + defaultTitle.slice(1);

    Swal.fire({
      title: "Generating...",
      text: "Please wait while your share link is being generated.",
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

      const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);

      if (!token) {
        return;
      }

      const response = await apiFetch(
        `${TEMP_SHARE_API_URL}/temp-file-upload`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: load,
        }
      );

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

          sessionStorage.removeItem(codeStorageKey);
          sessionStorage.removeItem(outputStorageKey);
          sessionStorage.removeItem(SESSION_STORAGE_SHARELINKS_KEY);

          navigate(`/${shareId}`);

          Swal.fire({
            icon: "success",
            title: "Share Link is generated",
            html: `<p class="mb-2">Your code is accessible at:</p><pre class="bg-gray-100 dark:bg-neutral-800 text-neutral-800 dark:text-white p-2 rounded text-sm overflow-x-auto select-text whitespace-pre-wrap break-words">${shareableLink}</pre>`,
            confirmButtonText: "Copy",
            showCancelButton: true,
            cancelButtonText: "Close",
            allowOutsideClick: false,
            footer: `<p class="text-center text-sm text-red-500 dark:text-red-300">You can delete shared links at any time from <span class="font-bold">Homepage</span>.</p>`,
          }).then(async (result) => {
            if (result.isConfirmed) {
              try {
                await navigator.clipboard.writeText(shareableLink.toString());

                Swal.fire({
                  title: "URL Copied!",
                  text: "",
                  icon: "success",
                  timer: 2000,
                });
              } catch (err) {
                Swal.fire({
                  title: "Failed to copy",
                  text: "Could not copy the URL to clipboard.",
                  icon: "error",
                });
              }
            }
          });
        }
      }
    } catch (err) {
      Swal.close();

      Swal.fire({
        icon: "error",
        title: "Failed!!",
        text: "Please try again.",
        timer: 5000,
      });

      console.error(err);
    }
  };

  const getRunCodeCount = async (language) => {
    const username = localStorage.getItem(LOCAL_STORAGE_USERNAME_KEY);

    if (!username) {
      return;
    }

    const response = await apiFetch(`${BACKEND_API_URL}/api/runCode/count`, {
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

    if (!username) {
      return;
    }

    const response = await apiFetch(
      `${BACKEND_API_URL}/api/generateCode/count`,
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
    const username = localStorage.getItem(LOCAL_STORAGE_USERNAME_KEY);

    if (!username) {
      return;
    }

    const response = await apiFetch(
      `${BACKEND_API_URL}/api/refactorCode/count`,
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

  const saveSharedLinkCount = async (shareId, title, expiryTime) => {
    try {
      const username = localStorage.getItem(LOCAL_STORAGE_USERNAME_KEY);

      if (!username) {
        return;
      }

      const countResponse = await apiFetch(
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
    if (!content || content.trim().length === 0) {
      return;
    }

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
      case "verilog":
        mimeType = "text/x-verilog";
        fileExtension = "v";
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
      code.trim().length !== 0
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
      disabled:
        loadingActionRun === "run" ||
        code.trim().length === 0 ||
        isGenerateBtnPressed ||
        isRefactorBtnPressed ||
        code.trim().length === 0,
    },
    {
      action: clearAll,
      bgColor: "bg-red-500",
      icon: <FaTrashAlt className="mr-2 mt-1" />,
      text: "Clear All",
      disabled:
        code.trim().length === 0 ||
        isGenerateBtnPressed ||
        isRefactorBtnPressed ||
        loadingActionRun === "run",
    },
    {
      action: handleCopy,
      bgColor: "bg-purple-500",
      icon: <FaCopy className="mr-2 mt-1" />,
      text: cpyBtnState,
      disabled: code.trim().length === 0,
    },
    {
      action: () => downloadFile(code, "file", language),
      bgColor: "bg-orange-500",
      icon: <FaDownload className="mr-2 mt-1" />,
      text: "Download",
      disabled: code.trim().length === 0,
    },
    {
      action: generateCodeMain,
      bgColor: "bg-green-500",
      icon:
        loadingActionGen === "thinking" ? (
          <GiBrain className="mr-2 mt-1 animate-bounce" />
        ) : loadingActionGen === "generate" ? (
          <FaSpinner className="mr-2 mt-1 animate-spin" />
        ) : (
          <FaMagic className="mr-2 mt-1" />
        ),
      text:
        loadingActionGen === "thinking"
          ? "Thinking..."
          : loadingActionGen === "generate"
          ? "Generating..."
          : "Generate",
      disabled:
        isDownloadBtnPressed || isRefactorBtnPressed || isGenerateBtnPressed,
    },
    {
      action: refactorCode,
      bgColor: "bg-yellow-500",
      icon:
        loadingActionRefactor === "thinking" ? (
          <GiBrain className="mr-2 mt-1 animate-bounce" />
        ) : loadingActionRefactor === "refactor" ? (
          <FaSpinner className="mr-2 mt-1 animate-spin" />
        ) : (
          <FaWrench className="mr-2 mt-1" />
        ),
      text:
        loadingActionRefactor === "thinking"
          ? "Thinking..."
          : loadingActionRefactor === "refactor"
          ? "Refactoring..."
          : "Refactor",
      disabled:
        code.trim().length === 0 ||
        isDownloadBtnPressed ||
        isGenerateBtnPressed ||
        isRefactorBtnPressed,
    },
    {
      action: shareLink,
      bgColor: "bg-fuchsia-500",
      icon: <FaShare className="mr-2 mt-1" />,
      text: "Share",
      disabled:
        code.trim().length === 0 ||
        loadingActionRun === "run" ||
        isRefactorBtnPressed ||
        isGenerateBtnPressed,
    },
  ];

  const RenderOutput = () => (
    <>
      <div className="mt-4">
        <div className="dark:bg-gray-800 dark:border-gray-700 bg-gray-300 rounded-t-lg p-2">
          <div className="flex items-center space-x-2">
            <BiTerminal className="ml-2 text-2xl" />
            <h2 className="text-xl">Output</h2>
          </div>
        </div>

        <pre
          ref={terminalRef}
          className="select-text font-mono text-xs font-semibold lg:text-sm focus:outline-none min-h-20 max-h-[295px] overflow-auto p-3 rounded-b-lg [scrollbar-width:thin] bg-[#eaeaea] text-[#292929] dark:bg-[#262636] dark:text-[#24a944]"
        >
          {output}
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
          loading={`Loading ${capFirst(language)} Editor...`}
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
              className={`px-6 py-2 ${bgColor} text-white inline-flex place-content-center rounded-md w-full cursor-pointer transition-transform duration-200 sm:w-auto md:hover:scale-105 focus:outline-none disabled:opacity-75 disabled:cursor-not-allowed`}
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
