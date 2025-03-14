import React, { useState, useEffect, useCallback, useRef } from "react";
import { debounce } from "lodash";
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
import { PiFileHtmlFill, PiFileCssFill, PiFileJsFill } from "react-icons/pi";
import { MdPreview } from "react-icons/md";
import { IoMdRefreshCircle } from "react-icons/io";
import { SlSizeFullscreen } from "react-icons/sl";
import { FaSpinner, FaDownload, FaWrench } from "react-icons/fa6";
import { FaMagic, FaTrashAlt, FaShare } from "react-icons/fa";
import Swal from "sweetalert2/dist/sweetalert2.js";

const EditorSection = ({
  language,
  value,
  onChange,
  theme,
  fontSize,
  readOnly,
}) => {
  const getLanguageIcon = () => {
    switch (language) {
      case "html":
        return PiFileHtmlFill;
      case "css":
        return PiFileCssFill;
      case "javascript":
        return PiFileJsFill;
      default:
        return null;
    }
  };

  return (
    <div className="dark:bg-gray-800 dark:border-gray-700 bg-gray-300 rounded-lg">
      <div className="flex items-center my-2 ml-3">
        {React.createElement(getLanguageIcon(), { className: "mr-2 text-xl" })}
        <h2 className="text-xl">
          {language.charAt(0).toUpperCase() + language.slice(1).toLowerCase()}{" "}
          Editor
        </h2>
      </div>
      <MonacoEditor
        language={language}
        value={value}
        onChange={(newValue) => onChange(language, newValue)}
        editorDidMount={(editor) => editor.focus()}
        options={{
          minimap: { enabled: false },
          matchBrackets: "always",
          fontFamily: "Source Code Pro",
          renderValidationDecorations: "on",
          scrollbar: { vertical: "visible", horizontal: "visible" },
          fontWeight: "bold",
          formatOnPaste: true,
          semanticHighlighting: true,
          folding: true,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: true,
          scrollBeyondLastLine: false,
          cursorStyle: "line",
          fontSize,
          readOnly,
        }}
        height="400px"
        theme={theme}
      />
    </div>
  );
};

const Editor = ({ isDarkMode, value, title, shareIdData }) => {
  const storageKey = `__${shareIdData || "htmlcssjs"}code__`;

  const [code, setCode] = useState(() => {
    const savedCode = sessionStorage.getItem(storageKey);
    return savedCode
      ? JSON.parse(savedCode)
      : {
          html: value.html || "",
          css: value.css || "",
          javascript: value.javascript || "",
        };
  });

  const [deviceType, setDeviceType] = useState("pc");
  const [loadingAction, setLoadingAction] = useState(null);
  const [generateBtnTxt, generatesetBtnTxt] = useState("Generate");
  const [refactorBtnTxt, refactorsetBtnTxt] = useState("Refactor");
  const [isGenerateBtnPressed, setisGenerateBtnPressed] = useState(false);
  const [isRefactorBtnPressed, setisRefactorBtnPressed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isEditorReadOnly, setIsEditorReadOnly] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const iframeRef = useRef(null);

  const fontSizeMap = {
    pc: 16,
    tablet: 14,
    mobile: 12,
  };

  const languages = ["html", "css", "javascript"];

  useEffect(() => {
    const capitalizeFirstLetter = (str) => {
      if (!str) return "";
      return str.charAt(0).toUpperCase() + str.slice(1);
    };

    const formattedTitle = title
      ? title.length > 30
        ? `${title.slice(0, 30)}...${title.slice(-3)}`
        : title
      : "";

    document.title = formattedTitle
      ? `${capitalizeFirstLetter(
          formattedTitle
        )} - HTML, CSS, JS Editor - Online IDE`
      : "HTML, CSS, JS Editor - Online IDE";
  }, [title]);

  const navigate = useNavigate();

  useEffect(() => {
    const storedCode = JSON.stringify(code);
    sessionStorage.setItem(storageKey, storedCode);

    const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
    if (token) {
      setIsLoggedIn(true);
    }
  }, [code]);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    const editorCode = JSON.parse(sessionStorage.getItem(storageKey));
    const { html, css, javascript } = editorCode;

    if (html.length === 0 && css.length === 0 && javascript.length === 0) {
      setCode({
        html: value.html || "",
        css: value.css || "",
        javascript: value.javascript || "",
      });
    }
  }, []);

  const updatePreview = useCallback(
    debounce(() => {
      const { html, css, javascript } = code;

      if (iframeRef.current) {
        const iframeDocument =
          iframeRef.current.contentDocument ||
          iframeRef.current.contentWindow.document;

        iframeDocument.open();
        iframeDocument.write(`
          <!DOCTYPE html>
          <html style="scrollbar-width: thin;">
            <head>
              <style>${css}</style>
            </head>
            <body>
              ${html}
              <script>
                (function() {
                  try {
                    ${javascript}
                  } catch (error) {
                    console.error("Error executing JS:", error);
                  }
                })();
              </script>
            </body>
          </html>
        `);
        iframeDocument.close();
      }
    }, 500),
    [code]
  );

  const openPreviewFullScreen = () => {
    const { html, css, javascript } = code;
    const newWindow = window.open("", "_blank");
    newWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Preview</title>
        <style>${css}</style>
      </head>
      <body>
        ${html}
        <script>
          (function() {
            try {
              ${javascript}
            } catch (error) {
              console.error("Error executing JS:", error);
            }
          })();
        </script>
      </body>
      </html>
    `);
    newWindow.document.close();
  };

  const handleRefresh = () => {
    let refreshTimeout;

    if (refreshTimeout) {
      clearTimeout(refreshTimeout);
    }

    setIsRefreshing(true);
    updatePreview();

    refreshTimeout = setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    updatePreview();
  }, [code, updatePreview]);

  const handleEditorChange = (language, value) => {
    setCode((prevCode) => ({ ...prevCode, [language]: value }));
  };

  const clearAll = () => {
    setCode({ html: "", css: "", javascript: "" });
    sessionStorage.removeItem(storageKey);

    const { html, css, javascript } = code;

    if (iframeRef.current) {
      const iframeDocument =
        iframeRef.current.contentDocument ||
        iframeRef.current.contentWindow.document;

      iframeDocument.open();
      iframeDocument.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <style>${css}</style>
          </head>
          <body>
            ${html}
            <script>
              (function() {
                try {
                  ${javascript}
                } catch (error) {
                  console.error("Error executing JS:", error);
                }
              })();
            </script>
          </body>
        </html>
      `);
      iframeDocument.close();
    }
  };

  const downloadFile = () => {
    const editorCode = JSON.parse(sessionStorage.getItem(storageKey));

    if (!editorCode) {
      return;
    }

    const { html, css, javascript } = editorCode;

    const cleanedHtml = html
      .replace(/<html.*?>|<\/html>/gi, "")
      .replace(/<head.*?>|<\/head>/gi, "")
      .replace(/<body.*?>|<\/body>/gi, "");

    const finalHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>${css}</style>
        </head>
        <body>
          ${cleanedHtml}
          <script>${javascript}</script>
        </body>
      </html>
    `;

    const blob = new Blob([finalHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "file.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCtrlS = (event) => {
    if (
      (event.ctrlKey || event.metaKey) &&
      event.key === "s" &&
      code.html.length !== 0 &&
      code.css.length !== 0 &&
      code.javascript.length !== 0
    ) {
      event.preventDefault();
      downloadFile();
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleCtrlS);
    return () => {
      document.removeEventListener("keydown", handleCtrlS);
    };
  }, []);

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
      setLoadingAction("generate");
      try {
        generatesetBtnTxt("Generating HTML...");
        setisGenerateBtnPressed(true);
        setIsEditorReadOnly(true);

        const responseHtml = await fetch(
          `${GENAI_API_URL}/htmlcssjsgenerate-code`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt,
              type: "html",
            }),
          }
        );

        if (!responseHtml.ok) {
          throw new Error("Failed to generate HTML.");
        }

        const resultHtml = await responseHtml.json();
        setCode({
          html: resultHtml.html || "",
          css: "",
          javascript: "",
        });

        generatesetBtnTxt("Generating CSS...");

        const responseCss = await fetch(
          `${GENAI_API_URL}/htmlcssjsgenerate-code`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt,
              htmlContent: resultHtml.html,
              type: "css",
            }),
          }
        );

        if (!responseCss.ok) {
          throw new Error("Failed to generate CSS.");
        }

        const resultCss = await responseCss.json();
        setCode((prevCode) => ({
          html: prevCode.html,
          css: resultCss.css || "",
          javascript: prevCode.javascript,
        }));

        generatesetBtnTxt("Generating JS...");

        const responseJs = await fetch(
          `${GENAI_API_URL}/htmlcssjsgenerate-code`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt,
              htmlContent: resultHtml.html,
              cssContent: resultCss.css,
              type: "js",
            }),
          }
        );

        if (!responseJs.ok) {
          throw new Error("Failed to generate JS.");
        }

        const resultJs = await responseJs.json();
        setCode((prevCode) => ({
          html: prevCode.html,
          css: prevCode.css,
          javascript: resultJs.js || "",
        }));

        await getGenerateCodeCount();
      } catch (error) {
        Swal.fire(
          "Error",
          error.message || "Failed to generate code.",
          "error"
        );
      } finally {
        generatesetBtnTxt("Generate");
        setisGenerateBtnPressed(false);
        setIsEditorReadOnly(false);
        setLoadingAction(null);
      }
    }
  };

  const refactorCode = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    setLoadingAction("refactor");
    try {
      refactorsetBtnTxt("Refactoring HTML...");
      setisRefactorBtnPressed(true);
      setIsEditorReadOnly(true);

      const updateCodeState = (html, css, js) => {
        setCode((prevCode) => ({
          html: html || prevCode.html,
          css: css || prevCode.css,
          javascript: js || prevCode.javascript,
        }));
      };

      let editorCode = JSON.parse(sessionStorage.getItem(storageKey));
      let { html, css, javascript } = editorCode;

      const responseHtml = await fetch(
        `${GENAI_API_URL}/htmlcssjsrefactor-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            html: html,
            css: css,
            javascript: javascript,
            type: "html",
          }),
        }
      );

      if (!responseHtml.ok) {
        throw new Error("Failed to refactor HTML.");
      }
      const resultHtml = await responseHtml.json();
      updateCodeState(resultHtml.html, null, null);

      refactorsetBtnTxt("Refactoring CSS...");

      editorCode = JSON.parse(sessionStorage.getItem(storageKey));
      const {
        html: updatedHtml,
        css: currentCss,
        javascript: currentJs,
      } = editorCode;

      const responseCss = await fetch(
        `${GENAI_API_URL}/htmlcssjsrefactor-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            html: updatedHtml || html,
            css: currentCss,
            javascript: currentJs,
            type: "css",
          }),
        }
      );

      if (!responseCss.ok) {
        throw new Error("Failed to refactor CSS.");
      }
      const resultCss = await responseCss.json();
      updateCodeState(null, resultCss.css, null);

      editorCode = JSON.parse(sessionStorage.getItem(storageKey));
      const {
        html: finalHtml,
        css: finalCss,
        javascript: currentJs2,
      } = editorCode;

      refactorsetBtnTxt("Refactoring JS...");

      const responseJs = await fetch(
        `${GENAI_API_URL}/htmlcssjsrefactor-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            html: finalHtml || html,
            css: finalCss || css,
            javascript: currentJs2,
            type: "js",
          }),
        }
      );

      if (!responseJs.ok) {
        throw new Error("Failed to refactor JS.");
      }
      const resultJs = await responseJs.json();
      updateCodeState(null, null, resultJs.js);

      if (isLoggedIn) {
        await getRefactorCodeCount();
      }
    } catch {
      Swal.fire("Error", "Failed to refactor code.", "error");
    } finally {
      refactorsetBtnTxt("Refactor");
      setisRefactorBtnPressed(false);
      setIsEditorReadOnly(false);
      setLoadingAction(null);
    }
  };

  const shareLink = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    const editorCode = JSON.parse(sessionStorage.getItem(storageKey));
    const language = "htmlcssjs";
    const defaultTitle = `${language}-untitled-${Math.random()
      .toString(36)
      .substring(2, 7)}`;

    if (!editorCode) {
      Swal.fire({
        icon: "error",
        title: "Missing Information",
        text: "Please provide the code before uploading.",
      });
      return;
    }

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

    const finalTitle =
      document.getElementById("titleInput").value || defaultTitle;
    const expiryTime =
      parseInt(
        document.querySelector('input[name="expiryTime"]:checked').value
      ) || 10;

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
        code: editorCode,
        language: language,
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
            } catch {
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
    } catch (error) {
      Swal.close();
      console.error(err);
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
        language: "HtmlJsCss",
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
        language: "HtmlJsCss",
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
        throw new Error("Username not found.");
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

  const buttonData = [
    {
      text: "Clear All",
      icon: <FaTrashAlt className="mr-2 mt-1" />,
      onClick: clearAll,
      disabled: false,
      color: "bg-red-500",
      loadingAction: null,
      iconLoading: null,
    },
    {
      text: "Download",
      icon: <FaDownload className="mr-2 mt-1" />,
      onClick: downloadFile,
      disabled:
        (code.html.length === 0 &&
          code.css.length === 0 &&
          code.javascript.length === 0) ||
        loadingAction === "generate" ||
        loadingAction === "refactor",
      color: "bg-orange-500",
      loadingAction: null,
      iconLoading: null,
    },
    {
      text: generateBtnTxt,
      icon:
        loadingAction === "generate" ? (
          <FaSpinner className="mr-2 mt-1 animate-spin" />
        ) : (
          <FaMagic className="mr-2 mt-1" />
        ),
      onClick: () => {
        if (!isRefactorBtnPressed) {
          generateCodeFromPrompt();
        }
      },
      disabled: loadingAction === "generate",
      color: "bg-green-500",
      loadingAction: "generate",
      iconLoading: <FaSpinner className="mr-2 mt-1 animate-spin" />,
    },
    {
      text: refactorBtnTxt,
      icon:
        loadingAction === "refactor" ? (
          <FaSpinner className="mr-2 mt-1 animate-spin" />
        ) : (
          <FaWrench className="mr-2 mt-1" />
        ),
      onClick: () => {
        if (!isGenerateBtnPressed) {
          refactorCode();
        }
      },
      disabled:
        code.html.length === 0 &&
        code.css.length === 0 &&
        code.javascript.length === 0,
      color: "bg-yellow-500",
      loadingAction: "refactor",
      iconLoading: <FaSpinner className="mr-2 mt-1 animate-spin" />,
    },
    {
      onClick: shareLink,
      color: "bg-fuchsia-500",
      icon: <FaShare className="mr-2 mt-1" />,
      text: "Share",
      disabled:
        (code.html.length === 0 &&
          code.css.length === 0 &&
          code.javascript.length === 0) ||
        loadingAction === "generate" ||
        loadingAction === "refactor",
    },
  ];

  return (
    <div className="mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-4">
        {languages.map((language) => (
          <EditorSection
            key={language}
            language={language}
            value={code[language]}
            onChange={handleEditorChange}
            theme={isDarkMode ? "vs-dark" : "vs-light"}
            fontSize={fontSizeMap[deviceType]}
            readOnly={isEditorReadOnly}
          />
        ))}
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-4">
        {buttonData.map(({ onClick, color, icon, text, disabled }, index) => (
          <button
            key={index}
            onClick={onClick}
            className={`px-6 py-2 ${color} text-white inline-flex place-content-center rounded-md w-full cursor-pointer transition-transform duration-200 sm:w-auto md:hover:scale-105 focus:outline-none`}
            disabled={disabled}
          >
            {icon}
            {text}
          </button>
        ))}
      </div>
      <div className="mt-4 relative flex flex-col items-start dark:bg-gray-800 dark:border-gray-700 bg-gray-300 rounded-t-lg">
        <div className="flex items-center">
          <MdPreview className="text-2xl mt-3 ml-3" />
          <h2 className="text-xl mt-3 ml-3">Preview</h2>
        </div>
        <button
          onClick={openPreviewFullScreen}
          className="absolute top-16 right-2 w-10 h-10 bg-transparent border-2 border-gray-500 text-gray-500 rounded-md cursor-pointer transition-all duration-300 hover:bg-gray-700/30 hover:text-white hover:border-gray-700"
          title="Fullscreen Preview"
        >
          <SlSizeFullscreen className="inline-flex text-xl pb-[3px]" />
        </button>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`absolute top-2 right-2 w-10 h-10 bg-transparent text-white rounded-md cursor-pointer transition-all duration-300 hover:text-gray-500 ${
            isRefreshing ? "animate-spin" : ""
          }`}
          title="Refresh Preview"
        >
          <IoMdRefreshCircle className="inline-flex text-4xl" />
        </button>

        <iframe
          ref={iframeRef}
          title="Preview"
          className="w-full mt-4 h-96 bg-white text-black"
        />
      </div>
    </div>
  );
};

export default Editor;
