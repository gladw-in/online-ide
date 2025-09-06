import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import NotFound from "../pages/NotFound";
import CodeEditor from "./CodeEditor";
import Editor from "./Editor";
import { apiFetch } from "../utils/apifetch";
import {
  SESSION_STORAGE_FETCH_STATUS_KEY,
  SESSION_STORAGE_SHARELINKS_KEY,
  TEMP_SHARE_API_URL,
  GENAI_API_URL,
  BACKEND_API_URL,
} from "../utils/constants";
import { FaSpinner, FaGolang } from "react-icons/fa6";
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
import { RiJavaFill } from "react-icons/ri";
import {
  PiFileCppFill,
  PiFileCSharpFill,
  PiFileCFill,
  PiFileSqlFill,
} from "react-icons/pi";
import { TbBrandKotlin } from "react-icons/tb";
import { BiLogoTypescript } from "react-icons/bi";
import { FiClipboard } from "react-icons/fi";
import { MdDone } from "react-icons/md";

const languageIcons = {
  python: IoLogoPython,
  javascript: SiJavascript,
  rust: SiRust,
  mongodb: SiMongodb,
  swift: SiSwift,
  ruby: SiRuby,
  dart: SiDart,
  perl: SiPerl,
  scala: SiScala,
  julia: SiJulia,
  go: FaGolang,
  java: RiJavaFill,
  cpp: PiFileCppFill,
  csharp: PiFileCSharpFill,
  c: PiFileCFill,
  sql: PiFileSqlFill,
  verilog: IoHardwareChipOutline,
  typescript: BiLogoTypescript,
  kotlin: TbBrandKotlin,
};

const isUUIDMatch = (inputString) => {
  const regex =
    /(c|cpp|csharp|dart|go|htmlcssjs|java|javascript|julia|kotlin|mongodb|perl|python|ruby|rust|scala|sql|swift|typescript|verilog)-([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/;
  return regex.test(inputString);
};

const ShareEditor = ({ isDarkMode }) => {
  const { shareId } = useParams();
  const [copiedLink, setCopiedLink] = useState(false);
  const [state, setState] = useState({
    code: "",
    language: "",
    expiryTime: null,
    title: "",
    shareIdNotFound: false,
    loading: true,
  });

  const copyBtnTimeout = useRef(null);

  const { code, language, expiryTime, title, shareIdNotFound, loading } = state;

  const icon = languageIcons[language] || null;

  const formattedTitle = title
    ? `${title.charAt(0).toUpperCase()}${
        title.length > 30
          ? title.slice(1, 30) + "..." + title.slice(-3)
          : title.slice(1)
      }`
    : "";

  const formattedExpiryTime = expiryTime
    ? new Date(expiryTime).toLocaleString()
    : "";

  const fetchCode = useCallback(async () => {
    if (!shareId) {
      setState((prev) => ({
        ...prev,
        shareIdNotFound: true,
        loading: false,
      }));
      return;
    }

    const fetchStatus = sessionStorage.getItem(
      SESSION_STORAGE_FETCH_STATUS_KEY
    );

    if (fetchStatus === "true") {
      const cachedData = sessionStorage.getItem(shareId);

      if (cachedData) {
        const { code, language, expiry_time, title } = JSON.parse(cachedData);

        setState({
          code,
          language,
          expiryTime: expiry_time,
          title,
          shareIdNotFound: false,
          loading: false,
        });
        return;
      }
    }

    try {
      setState((prev) => ({ ...prev, loading: true }));
      const response = await fetch(`${TEMP_SHARE_API_URL}/file/${shareId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-File-ID": `${shareId}`,
        },
      });

      if (response.ok) {
        const data = await response.json();

        if (data.error) {
          if (data.error === "File has expired") {
            setState({
              code: "",
              language: "",
              expiryTime: null,
              title: "",
              shareIdNotFound: false,
              loading: false,
            });

            deleteSharedLink(shareId);
          } else if (response.status === 404) {
            setState({
              code: "",
              language: "",
              expiryTime: null,
              title: "",
              shareIdNotFound: true,
              loading: false,
            });

            deleteSharedLink(shareId);
          }
        } else {
          setState({
            code: data.code,
            language: data.language,
            expiryTime: data.expiry_time,
            title: data.title,
            shareIdNotFound: false,
            loading: false,
          });

          sessionStorage.setItem(
            shareId,
            JSON.stringify({
              code: data.code,
              language: data.language,
              expiry_time: data.expiry_time,
              title: data.title,
            })
          );
          sessionStorage.setItem(SESSION_STORAGE_FETCH_STATUS_KEY, "true");
        }
      } else {
        setState({
          code: "",
          language: "",
          expiryTime: null,
          title: "",
          shareIdNotFound: true,
          loading: false,
        });

        deleteSharedLink(shareId);
        sessionStorage.setItem(SESSION_STORAGE_FETCH_STATUS_KEY, "false");
      }
    } catch (error) {
      setState({
        code: "",
        language: "",
        expiryTime: null,
        title: "",
        shareIdNotFound: true,
        loading: false,
      });

      deleteSharedLink(shareId);
      sessionStorage.setItem(SESSION_STORAGE_FETCH_STATUS_KEY, "false");
    }
  }, [shareId]);

  const deleteSharedLink = async (shareId) => {
    const linkResponse = await apiFetch(`${BACKEND_API_URL}/api/sharedLink`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ shareId }),
    });

    const responseJson = await linkResponse.json();

    if (!linkResponse.ok) {
      throw new Error(
        `Error deleting shared link: ${linkResponse.status} - ${responseJson.msg}`
      );
    } else {
      sessionStorage.removeItem(SESSION_STORAGE_SHARELINKS_KEY);
    }
  };

  useEffect(() => {
    if (!isUUIDMatch(shareId)) {
      setState({
        code: "",
        language: "",
        expiryTime: null,
        title: "",
        shareIdNotFound: true,
        loading: false,
      });
      return;
    }

    const cachedData = sessionStorage.getItem(shareId);

    if (cachedData) {
      const { expiry_time } = JSON.parse(cachedData);
      const expiryDate = new Date(expiry_time);
      const currentDate = new Date();

      if (expiryDate < currentDate) {
        sessionStorage.removeItem(shareId);
        sessionStorage.setItem(SESSION_STORAGE_FETCH_STATUS_KEY, "false");
        setState({
          code: "",
          language: "",
          expiryTime: null,
          title: "",
          shareIdNotFound: true,
          loading: false,
        });
        return;
      }

      const { code, language, title } = JSON.parse(cachedData);
      setState({
        code,
        language,
        expiryTime: expiry_time,
        title,
        shareIdNotFound: false,
        loading: false,
      });
      return;
    }

    fetchCode();
  }, [shareId, fetchCode]);

  const handleCopyLink = async () => {
    if (!loading) {
      try {
        const shareLink = new URL(`${window.location.origin}/${shareId}`);
        await navigator.clipboard.writeText(shareLink.toString());
      } catch (err) {
        Swal.fire({
          title: "Failed to copy",
          text: "Could not copy the URL to clipboard.",
          icon: "error",
        });
      }
    }

    if (copyBtnTimeout.current) {
      clearTimeout(copyBtnTimeout.current);
    }

    setCopiedLink(true);

    copyBtnTimeout.current = setTimeout(() => {
      setCopiedLink(false);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-2 bg-gray-100 dark:bg-gray-900">
        <div className="flex items-center text-lg text-gray-500 font-medium">
          <span>Loading</span>
          <FaSpinner className="ml-2 animate-spin" />
        </div>
      </div>
    );
  }

  if (shareIdNotFound) {
    return <NotFound />;
  }

  return (
    <div>
      {expiryTime && title && (
        <div className="ml-5 text-sm text-gray-500 select-text font-medium pt-3 flex flex-col sm:flex-row sm:items-center sm:justify-start">
          <div className="mb-2 sm:mb-0">
            <span className="mr-2">Title:</span>
            <span title={title}>{formattedTitle}</span>
          </div>
          <div className="flex items-center">
            <span className="mr-2 sm:ml-4">Expires on:</span>
            <span>{formattedExpiryTime}</span>
          </div>
          <div className="mt-2 select-none items-center sm:mt-0 sm:ml-4">
            <button
              onClick={handleCopyLink}
              title="Click to copy the link"
              className="flex cursor-pointer hover:text-gray-400"
            >
              {copiedLink ? (
                <MdDone className="mr-1 mt-1" />
              ) : (
                <FiClipboard className="mr-1 mt-1" />
              )}

              {copiedLink ? "Link Copied!" : "Copy Link"}
            </button>
          </div>
        </div>
      )}

      {language === "htmlcssjs" ? (
        <Editor
          shareIdData={shareId}
          title={title}
          value={code}
          isDarkMode={isDarkMode}
        />
      ) : (
        <CodeEditor
          shareIdData={shareId}
          title={title}
          language={language}
          reactIcon={icon}
          apiEndpoint={`${GENAI_API_URL}/get-output`}
          isDarkMode={isDarkMode}
          defaultCode={code}
        />
      )}
    </div>
  );
};

export default ShareEditor;
