import React, { useState, useEffect, useCallback } from "react";
import { debounce } from "lodash";
import MonacoEditor from "@monaco-editor/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrashAlt,
  faDownload,
  faMagic,
  faWrench,
  faSpinner,
  faExpand,
} from "@fortawesome/free-solid-svg-icons";
import { faHtml5, faCss3Alt, faJs } from "@fortawesome/free-brands-svg-icons";
import Swal from "sweetalert2";
import "sweetalert2/src/sweetalert2.scss";
import sampleHtml from "./samples/index.html?raw";
import sampleCSS from "./samples/style.css?raw";

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
        return faHtml5;
      case "css":
        return faCss3Alt;
      case "javascript":
        return faJs;
      default:
        return null;
    }
  };

  return (
    <div className="dark:bg-gray-800 dark:border-gray-700 bg-gray-200 rounded-lg">
      <div className="flex items-center my-2 ml-3">
        <FontAwesomeIcon icon={getLanguageIcon()} className="mr-2 text-xl" />
        <h2 className="text-xl">{language.toUpperCase()}</h2>
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

const Editor = ({ isDarkMode }) => {
  const [code, setCode] = useState(() => {
    const savedCode = sessionStorage.getItem("editorCode");
    return savedCode
      ? JSON.parse(savedCode)
      : { html: sampleHtml, css: sampleCSS, js: "" };
  });

  const [deviceType, setDeviceType] = useState("pc");
  const [loadingAction, setLoadingAction] = useState(null);
  const [generateBtnTxt, generatesetBtnTxt] = useState("Generate");
  const [refactorBtnTxt, refactorsetBtnTxt] = useState("Refactor");
  const [isGenerateBtnPressed, setisGenerateBtnPressed] = useState(false);
  const [isRefactorBtnPressed, setisRefactorBtnPressed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isEditorReadOnly, setIsEditorReadOnly] = useState(false);

  const fontSizeMap = {
    pc: 16,
    tablet: 14,
    mobile: 12,
  };

  const languages = ["html", "css", "javascript"];

  document.title = "HTML, CSS, JS Editor";

  useEffect(() => {
    const storedCode = JSON.stringify(code);
    sessionStorage.setItem("editorCode", storedCode);

    const token = localStorage.getItem("token");
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

  const updatePreview = useCallback(
    debounce(() => {
      const { html, css, js } = code;
      const iframe = document.getElementById("previewFrame");

      if (iframe) {
        const iframeDocument =
          iframe.contentDocument || iframe.contentWindow.document;

        iframeDocument.open();
        iframeDocument.write(`
          <html>
          <head>
            <style>${css}</style>
          </head>
          <body>
            ${html}
            <script>
              (function() {
                try {
                  ${js}
                } catch (error) {
                  console.error("Error executing JS:", error);
                }
              })();
            </script>
          </body>
        </html>
        `);
        iframeDocument.close();
      } else {
        console.error("Iframe not found");
      }
    }, 500),
    [code]
  );

  const openPreviewFullScreen = () => {
    const { html, css, js } = code;
    const newWindow = window.open("", "_blank");
    newWindow.document.write(`
      <html>
      <head>
        <style>${css}</style>
      </head>
      <body>
        ${html}
        <script>
          (function() {
            try {
              ${js}
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

  useEffect(() => {
    updatePreview();
  }, [code, updatePreview]);

  const handleEditorChange = (language, value) => {
    setCode((prevCode) => ({ ...prevCode, [language]: value }));
  };

  const clearAll = () => {
    setCode({ html: "", css: "", js: "" });
    sessionStorage.removeItem("editorCode");

    const iframe = document.getElementById("previewFrame");

    if (iframe) {
      const iframeDocument =
        iframe.contentDocument || iframe.contentWindow.document;

      iframeDocument.open();
      iframeDocument.write(`
        <html>
          <head>
            <style>${css}</style>
          </head>
          <body>
            ${html}
            <script>
              (function() {
                try {
                  ${js}
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
    let { html, css, js } = code;
    html = html.replace(/<html.*?>|<\/html>/gi, "");
    html = html.replace(/<head.*?>|<\/head>/gi, "");
    html = html.replace(/<body.*?>|<\/body>/gi, "");

    const finalHtml = `
      <html>
        <head>
          <style>${css}</style>
        </head>
        <body>
          ${html}
          <script>${js}</script>
        </body>
      </html>
    `;

    const blob = new Blob([finalHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "code.html";
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateCodeFromPrompt = async () => {
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
        generatesetBtnTxt("Generating Html...");
        setisGenerateBtnPressed(true);
        setIsEditorReadOnly(true);
        const responseHtml = await fetch(
          `${
            import.meta.env.VITE_NVIDIA_NIM_APP_API_URL
          }/htmlcssjsgenerate-code`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
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
          js: "",
        });

        generatesetBtnTxt("Generating css...");

        const responseCss = await fetch(
          `${
            import.meta.env.VITE_NVIDIA_NIM_APP_API_URL
          }/htmlcssjsgenerate-code`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              prompt,
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
          js: prevCode.js,
        }));

        generatesetBtnTxt("Generating js...");

        const responseJs = await fetch(
          `${
            import.meta.env.VITE_NVIDIA_NIM_APP_API_URL
          }/htmlcssjsgenerate-code`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              prompt,
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
          js: resultJs.js || "",
        }));
        getGenerateCodeCount();
      } catch (error) {
        Swal.fire("Error", "Failed to generate code.", "error");
      } finally {
        generatesetBtnTxt("Generate");
        setisGenerateBtnPressed(false);
        setIsEditorReadOnly(false);
        setLoadingAction(null);
      }
    }
  };

  const refactorCode = async () => {
    setLoadingAction("refactor");
    try {
      refactorsetBtnTxt("Refactoring Html...");
      setisRefactorBtnPressed(true);
      setIsEditorReadOnly(true);

      const responseHtml = await fetch(
        `${import.meta.env.VITE_NVIDIA_NIM_APP_API_URL}/htmlcssjsrefactor-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            html: code.html,
            css: code.css,
            js: code.js,
            type: "html",
          }),
        }
      );

      if (!responseHtml.ok) {
        throw new Error("Failed to refactor HTML.");
      }

      const resultHtml = await responseHtml.json();
      setCode({
        html: resultHtml.html || code.html,
        css: code.css,
        js: code.js,
      });

      refactorsetBtnTxt("Refactoring css...");

      const responseCss = await fetch(
        `${import.meta.env.VITE_NVIDIA_NIM_APP_API_URL}/htmlcssjsrefactor-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            html: resultHtml.html || code.html,
            css: code.css,
            js: code.js,
            type: "css",
          }),
        }
      );

      if (!responseCss.ok) {
        throw new Error("Failed to refactor CSS.");
      }

      const resultCss = await responseCss.json();
      setCode((prevCode) => ({
        html: prevCode.html,
        css: resultCss.css || prevCode.css,
        js: prevCode.js,
      }));

      refactorsetBtnTxt("Refactoring js...");

      const responseJs = await fetch(
        `${import.meta.env.VITE_NVIDIA_NIM_APP_API_URL}/htmlcssjsrefactor-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            html: resultHtml.html || code.html,
            css: resultCss.css || code.css,
            js: code.js,
            type: "js",
          }),
        }
      );

      if (!responseJs.ok) {
        throw new Error("Failed to refactor JS.");
      }

      const resultJs = await responseJs.json();
      setCode((prevCode) => ({
        html: prevCode.html,
        css: prevCode.css,
        js: resultJs.js || prevCode.js,
      }));
      getRefactorCodeCount();
    } catch (error) {
      Swal.fire("Error", "Failed to refactor code.", "error");
    } finally {
      refactorsetBtnTxt("Refactor");
      setisRefactorBtnPressed(false);
      setIsEditorReadOnly(false);
      setLoadingAction(null);
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
          language: "HtmlJsCss",
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
          language: "HtmlJsCss",
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to send request");
    }
  };

  return (
    <div className="container mx-auto p-4">
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
        <button
          onClick={clearAll}
          className="px-6 py-2 bg-red-500 text-white rounded-md w-full sm:w-auto"
        >
          <FontAwesomeIcon icon={faTrashAlt} className="mr-2" />
          Clear All
        </button>
        <button
          onClick={() => downloadFile()}
          className="px-6 py-2 bg-purple-500 text-white rounded-md w-full sm:w-auto"
          disabled={
            code.html.length === 0 &&
            code.css.length === 0 &&
            code.js.length === 0
          }
        >
          <FontAwesomeIcon icon={faDownload} className="mr-2" />
          Download
        </button>
        {isLoggedIn && (
          <>
            <button
              onClick={() => {
                if (!isRefactorBtnPressed) {
                  generateCodeFromPrompt();
                }
              }}
              className="px-6 py-2 bg-green-500 text-white rounded-md w-full sm:w-auto"
              disabled={loadingAction === "generate"}
            >
              {loadingAction === "generate" ? (
                <FontAwesomeIcon
                  icon={faSpinner}
                  className="mr-2 animate-spin"
                />
              ) : (
                <FontAwesomeIcon icon={faMagic} className="mr-2" />
              )}
              {generateBtnTxt}
            </button>
            <button
              onClick={() => {
                if (!isGenerateBtnPressed) {
                  refactorCode();
                }
              }}
              className="px-6 py-2 bg-yellow-500 text-white rounded-md w-full sm:w-auto"
              disabled={loadingAction === "refactor"}
            >
              {loadingAction === "refactor" ? (
                <FontAwesomeIcon
                  icon={faSpinner}
                  className="mr-2 animate-spin"
                />
              ) : (
                <FontAwesomeIcon icon={faWrench} className="mr-2" />
              )}
              {refactorBtnTxt}
            </button>
          </>
        )}
      </div>
      <div className="mt-4 relative">
        <h2 className="text-xl mb-2">Preview</h2>
        <button
          onClick={openPreviewFullScreen}
          className="absolute top-14 right-2 w-12 h-12 bg-transparent border-2 border-gray-500 text-gray-500 rounded-md transition-all duration-300 hover:bg-gray-700 hover:text-white hover:border-gray-700"
          title="Fullscreen"
        >
          <FontAwesomeIcon icon={faExpand} className="text-xl" />
        </button>
        <iframe
          id="previewFrame"
          title="Preview"
          className="w-full mt-4 h-96 border-2 dark:border-gray-700 dark:text-black dark:bg-white"
        />
      </div>
    </div>
  );
};

export default Editor;
