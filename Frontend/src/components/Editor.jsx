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
import { apiFetch } from "../utils/apifetch";
import blocker from "../utils/blocker.js";
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
  editorDidMount,
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

  const capFirst = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className="dark:bg-gray-800 dark:border-gray-700 bg-gray-300 rounded-lg">
      <div className="flex items-center my-2 ml-3">
        {React.createElement(getLanguageIcon(), { className: "mr-2 text-xl" })}
        <h2 className="text-xl">{capFirst(language)} Editor</h2>
      </div>
      <MonacoEditor
        language={language}
        value={value}
        onMount={editorDidMount(language)}
        onChange={(newValue) => onChange(language, newValue)}
        editorDidMount={(editor) => editor.focus()}
        loading={`Loading ${capFirst(language)} Editor...`}
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
  const storageKey = `__${shareIdData || "htmlcssjs"}Code__`;

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
  const [isPreviewEnabled, setIsPreviewEnabled] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isEditorReadOnly, setIsEditorReadOnly] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [overlayText, setOverlayText] = useState(false);

  const iframeRef = useRef(null);
  const editorRefs = useRef({});

  const fontSizeMap = {
    pc: 16,
    tablet: 14,
    mobile: 12,
  };

  const languages = ["html", "css", "javascript"];

  const capFirst = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  useEffect(() => {
    const formattedTitle = title
      ? title.length > 30
        ? `${title.slice(0, 30)}...${title.slice(-3)}`
        : title
      : "";

    document.title = formattedTitle
      ? `${capFirst(formattedTitle)} - HTML, CSS, JS Editor - Online IDE`
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

    if (
      html.trim().length === 0 &&
      css.trim().length === 0 &&
      javascript.trim().length === 0
    ) {
      setCode({
        html: value.html || "",
        css: value.css || "",
        javascript: value.javascript || "",
      });
    }
  }, []);

  const editorDidMount = (id) => (editor, monaco) => {
    editorRefs.current[id] = editor;
  };

  const updatePreview = useCallback(
    debounce(() => {
      if (!isPreviewEnabled) return;

      try {
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
            <style>${css.trim() || ""}</style>
            <script>${blocker || ""}</script>
          </head>
          <body>
            ${html.trim() || ""}
            <script>
              (function() {
                try {
                  ${javascript.trim() || ""}
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
      } catch {}
    }, 500),
    [code, isPreviewEnabled]
  );

  const openPreviewFullScreen = () => {
    try {
      const { html, css, javascript } = code;
      const newWindow = window.open("", "_blank");
      newWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Preview</title>
        <style>${css.trim() || ""}</style>
        <script>${blocker || ""}</script>
      </head>
      <body>
        ${html.trim() || ""}
        <script>
          (function() {
            try {
              ${javascript.trim() || ""}
            } catch (error) {
              console.error("Error executing JS:", error);
            }
          })();
        </script>
      </body>
      </html>
    `);
      newWindow.document.close();
    } catch {}
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
            <style>${css || ""}</style>
          </head>
          <body>
            ${html || ""}
            <script>
              (function() {
                try {
                  ${javascript || ""}
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

    if (
      html.trim().length === 0 &&
      css.trim().length === 0 &&
      javascript.trim().length === 0
    )
      return;

    const cleanedHtml = html
      .replace(/<html.*?>|<\/html>/gi, "")
      .replace(/<head.*?>|<\/head>/gi, "")
      .replace(/<body.*?>|<\/body>/gi, "");

    const finalHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>${css || ""}</style>
        </head>
        <body>
          ${cleanedHtml || ""}
          <script>${javascript || ""}</script>
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

  const scrollToLastLine = (editorId) => {
    const editor = editorRefs.current[editorId];
    if (editor) {
      const model = editor.getModel();
      if (model) {
        const lastLine = model.getLineCount();
        editor.revealLineInCenter(lastLine);
      }
    }
  };

  const handleCtrlS = (event) => {
    const editorCode = JSON.parse(sessionStorage.getItem(storageKey));

    if (!editorCode) {
      return;
    }

    const { html, css, javascript } = editorCode;

    if (
      (event.ctrlKey || event.metaKey) &&
      event.key === "s" &&
      !(
        html.trim().length === 0 &&
        css.trim().length === 0 &&
        javascript.trim().length === 0
      )
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

  const generateCodeStream = async (type, data, onChunk) => {
    let result = "";

    try {
      const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
      if (!token) throw new Error("Token not found");

      const response = await apiFetch(
        `${GENAI_API_URL}/htmlcssjsgenerate-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok || !response.body) {
        throw new Error("Failed to generate code.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        result += chunk;
        if (typeof onChunk === "function") {
          onChunk(chunk);
        }
      }
    } catch (error) {
      Swal.fire("Error", "Failed to generate code.", "error");
    }

    return result;
  };

  const generateCodeMain = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

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
        if (!value) return "This field is mandatory! Please enter a prompt.";
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

    setLoadingAction("generate");
    setIsOverlayVisible(true);
    generatesetBtnTxt("Generating...");
    setOverlayText("Generating HTML...");
    setisGenerateBtnPressed(true);
    setIsEditorReadOnly(true);

    try {
      let htmlCode = "",
        cssCode = "",
        jsCode = "";

      let isFirstChunk = true;

      htmlCode = await generateCodeStream(
        "html",
        { prompt, type: "html" },
        (chunk) => {
          if (isFirstChunk) {
            setIsPreviewEnabled(false);
            setCode((prev) => ({ ...prev, html: "" }));
            isFirstChunk = false;
          }

          setCode((prev) => ({ ...prev, html: (prev.html || "") + chunk }));
          scrollToLastLine(languages[0]);
        }
      );

      setIsPreviewEnabled(true);

      isFirstChunk = true;

      setOverlayText("Generating CSS...");

      cssCode = await generateCodeStream(
        "css",
        { prompt, htmlContent: htmlCode, type: "css" },
        (chunk) => {
          if (isFirstChunk) {
            setIsPreviewEnabled(false);
            setCode((prev) => ({ ...prev, css: "" }));
            isFirstChunk = false;
          }
          setCode((prev) => ({ ...prev, css: (prev.css || "") + chunk }));
          scrollToLastLine(languages[1]);
        }
      );

      setIsPreviewEnabled(true);

      isFirstChunk = true;

      setOverlayText("Generating JS...");

      jsCode = await generateCodeStream(
        "js",
        {
          prompt,
          htmlContent: htmlCode,
          cssContent: cssCode,
          type: "js",
        },
        (chunk) => {
          if (isFirstChunk) {
            setIsPreviewEnabled(false);
            setCode((prev) => ({ ...prev, javascript: "" }));
            isFirstChunk = false;
          }
          setCode((prev) => ({
            ...prev,
            javascript: (prev.javascript || "") + chunk,
          }));
          scrollToLastLine(languages[2]);
        }
      );

      setIsPreviewEnabled(true);

      if (isLoggedIn) {
        await getGenerateCodeCount();
      }
    } catch (error) {
      Swal.fire("Error", "Failed to generate code.", "error");
    } finally {
      generatesetBtnTxt("Generate");
      setisGenerateBtnPressed(false);
      setIsEditorReadOnly(false);
      setLoadingAction(null);
      setIsOverlayVisible(false);
      setOverlayText(null);
    }
  };

  const refactorCode = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    const { value: formValues, isConfirmed } = await Swal.fire({
      title: "Refactor Code",
      html: `
        <div id="custom-html-wrapper">
          <div class="swal2-radio-group gap-x-[10px] flex text-left my-4 justify-center">
            <label><input type="radio" name="codeType" value="all" checked> All</label><br>
            <label><input type="radio" name="codeType" value="html"> HTML</label><br>
            <label><input type="radio" name="codeType" value="css"> CSS</label><br>
            <label><input type="radio" name="codeType" value="js"> JavaScript</label>
          </div>
          <textarea id="swal-input-textarea" class="swal2-textarea" placeholder="e.g., remove comments, optimize loop, etc."></textarea>
        </div>
      `,
      didOpen: () => {
        const container = document.getElementById("swal2-html-container");
        const customWrapper = document.getElementById("custom-html-wrapper");
        const inputTextarea = document.getElementById("swal-input-textarea");

        if (
          customWrapper &&
          container &&
          container.parentElement &&
          inputTextarea
        ) {
          container.parentElement.insertBefore(customWrapper, container);
          inputTextarea.focus();

          container.style.display = "none";
          inputTextarea.style.width = "-webkit-fill-available";
          inputTextarea.style.width = "-moz-available";
        }

        const modal = Swal.getPopup();
        modal.addEventListener("keydown", (e) => {
          if (e.key === "Enter" && e.ctrlKey) {
            e.preventDefault();
            Swal.clickConfirm();
          }
        });
      },
      focusConfirm: false,
      preConfirm: () => {
        const selectedType = document.querySelector(
          'input[name="codeType"]:checked'
        ).value;
        const suggestion = document.getElementById("swal-input-textarea").value;
        return { selectedType, suggestion };
      },
      confirmButtonText: "Refactor",
      showCancelButton: true,
      allowOutsideClick: false,
      footer:
        '<p class="text-center text-sm text-red-500 dark:text-red-300">Suggestions help improve results, <span class="font-bold">but are optional</span>.</p>',
    });

    if (!isConfirmed) return;

    const selectedType = formValues.selectedType;
    const prompt = formValues.suggestion;

    setLoadingAction("refactor");
    setIsOverlayVisible(true);
    refactorsetBtnTxt("Refactoring...");
    setisRefactorBtnPressed(true);
    setIsEditorReadOnly(true);

    try {
      const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
      if (!token) return;

      let editorCode = JSON.parse(sessionStorage.getItem(storageKey));
      let { html, css, javascript } = editorCode;

      const refactor = async (type, code) => {
        const response = await apiFetch(
          `${GENAI_API_URL}/htmlcssjsrefactor-code`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              html: code.html || html,
              css: code.css || css,
              javascript: code.javascript || javascript,
              type,
              problem_description: prompt.trim() || null,
            }),
          }
        );

        if (!response.ok)
          throw new Error(`Failed to refactor ${type.toUpperCase()}.`);
        return await response.json();
      };

      const updateCodeState = (newHtml, newCss, newJs) => {
        setCode((prevCode) => ({
          html: newHtml || prevCode.html,
          css: newCss || prevCode.css,
          javascript: newJs || prevCode.javascript,
        }));
      };

      if (selectedType === "all" || selectedType === "html") {
        setOverlayText("Refactoring HTML...");
        const resultHtml = await refactor("html", { html, css, javascript });
        updateCodeState(resultHtml.html, null, null);
        html = resultHtml.html;
        scrollToLastLine(languages[0]);
      }

      if (selectedType === "all" || selectedType === "css") {
        setOverlayText("Refactoring CSS...");
        const resultCss = await refactor("css", { html, css, javascript });
        updateCodeState(null, resultCss.css, null);
        css = resultCss.css;
        scrollToLastLine(languages[1]);
      }

      if (selectedType === "all" || selectedType === "js") {
        setOverlayText("Refactoring JS...");
        const resultJs = await refactor("js", { html, css, javascript });
        updateCodeState(null, null, resultJs.js);
        scrollToLastLine(languages[2]);
      }

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
      setIsOverlayVisible(false);
      setOverlayText(null);
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
      html: ShareLinkModal(capFirst(defaultTitle)),
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

    const finalTitle =
      document.getElementById("titleInput").value ||
      defaultTitle.charAt(0).toUpperCase() + defaultTitle.slice(1);
    const expiryTime =
      parseInt(
        document.querySelector('input[name="expiryTime"]:checked').value
      ) || 10;

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
        code: editorCode,
        language: language,
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
            } catch {
              console.error(err);
            }
          }

          Swal.close();

          sessionStorage.removeItem(storageKey);
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
    } catch (error) {
      Swal.close();

      Swal.fire({
        icon: "error",
        title: "Failed!!",
        text: "Please try again.",
        timer: 5000,
      });

      console.error(error);
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
          language: "HtmlJsCss",
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
          language: "HtmlJsCss",
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
        throw new Error("Failed to send request");
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
      disabled:
        (code.html.length === 0 &&
          code.css.length === 0 &&
          code.javascript.length === 0) ||
        loadingAction === "generate" ||
        loadingAction === "refactor",
      color: "bg-red-500",
      loadingAction: null,
      iconLoading: null,
    },
    {
      text: "Download",
      icon: <FaDownload className="mr-2 mt-1" />,
      onClick: downloadFile,
      disabled:
        code.html.trim().length === 0 &&
        code.css.trim().length === 0 &&
        code.javascript.trim().length === 0,
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
          generateCodeMain();
        }
      },
      disabled: loadingAction === "generate" || loadingAction === "refactor",
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
        (code.html.trim().length === 0 &&
          code.css.trim().length === 0 &&
          code.javascript.trim().length === 0) ||
        loadingAction === "generate" ||
        loadingAction === "refactor",
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
        (code.html.trim().length === 0 &&
          code.css.trim().length === 0 &&
          code.javascript.trim().length === 0) ||
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
            editorDidMount={editorDidMount}
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
            className={`px-6 py-2 ${color} text-white inline-flex place-content-center rounded-md w-full cursor-pointer transition-transform duration-200 sm:w-auto md:hover:scale-105 focus:outline-none disabled:opacity-75 disabled:cursor-not-allowed`}
            disabled={disabled}
          >
            {icon}
            {text}
          </button>
        ))}
      </div>
      <div className="mt-4 relative flex flex-col items-start dark:bg-gray-800 dark:border-gray-700 bg-gray-300 rounded-t-lg">
        {isOverlayVisible && overlayText && (
          <div className="absolute inset-0 bg-transparent flex justify-center items-center z-[2] rounded-lg backdrop-blur-[2px]">
            <div className="bg-white bg-opacity-70 p-4 rounded-lg shadow-lg flex items-center space-x-2 sm:w-auto dark:bg-gray-800 dark:text-white">
              <FaSpinner className="text-2xl animate-spin" />
              <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                {overlayText}
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center z-[3]">
          <MdPreview className="text-2xl mt-3 ml-3" />
          <h2 className="text-xl mt-3 ml-3">Preview</h2>
        </div>
        <button
          onClick={openPreviewFullScreen}
          disabled={isOverlayVisible}
          className="absolute top-16 right-2 w-10 h-10 bg-transparent border-2 border-gray-500 text-gray-500 rounded-md cursor-pointer transition-all duration-300 hover:bg-gray-700/30 hover:text-white hover:border-gray-700"
          title="Fullscreen Preview"
        >
          <SlSizeFullscreen className="inline-flex text-xl pb-[3px]" />
        </button>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing || isOverlayVisible}
          className={`absolute top-2 right-2 w-10 h-10 bg-transparent rounded-md cursor-pointer transition-all duration-300 hover:text-gray-500 ${
            isRefreshing ? "animate-spin" : ""
          }`}
          title="Refresh Preview"
        >
          <IoMdRefreshCircle className="inline-flex text-4xl" />
        </button>

        <iframe
          ref={iframeRef}
          title="Preview"
          className="w-full mt-4 h-96 bg-white text-black border border-gray-300 dark:border-gray-800"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
};

export default Editor;
