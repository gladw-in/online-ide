import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaSpinner, FaBarsStaggered } from "react-icons/fa6";
import { SiIfixit } from "react-icons/si";
import { RxMoon, RxSun } from "react-icons/rx";
import Swal from "sweetalert2/dist/sweetalert2.js";
import "sweetalert2/src/sweetalert2.scss";
import {
  SESSION_STORAGE_SHARELINKS_KEY,
  SESSION_STORAGE_FETCH_STATUS_KEY,
  LOCAL_STORAGE_TOKEN_KEY,
  LOCAL_STORAGE_USERNAME_KEY,
  LOCAL_STORAGE_LOGIN_KEY,
  LOCAL_STORAGE_THEME_KEY,
  LOCAL_STORAGE_GOOGLE_USER,
  BACKEND_API_URL,
} from "../utils/constants";

const Header = ({ isDarkMode, toggleTheme }) => {
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setLoading] = useState(true);

  const baseUrl = window.location.origin;

  const clearAuthState = () => {
    localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
    localStorage.removeItem(LOCAL_STORAGE_USERNAME_KEY);
    localStorage.removeItem(LOCAL_STORAGE_LOGIN_KEY);
    localStorage.removeItem(LOCAL_STORAGE_GOOGLE_USER);
    sessionStorage.removeItem(SESSION_STORAGE_SHARELINKS_KEY);
    sessionStorage.removeItem(SESSION_STORAGE_FETCH_STATUS_KEY);
  };

  useEffect(() => {
    const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
    const storedUsername = localStorage.getItem(LOCAL_STORAGE_USERNAME_KEY);
    const login = localStorage.getItem(LOCAL_STORAGE_LOGIN_KEY);

    if (token && storedUsername && login === "true") {
      fetchUserData(token, storedUsername);
    } else {
      clearAuthState();
      setIsLoggedIn(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === LOCAL_STORAGE_GOOGLE_USER) {
        clearAuthState();
        setIsLoggedIn(false);
        setUsername("");
        location.reload();
      }
    };

    const timerId = setTimeout(() => {
      const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
      if (!token && !isLoggedIn) return;
      window.addEventListener("storage", handleStorageChange);
    }, 2000);

    return () => {
      clearTimeout(timerId);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [isLoggedIn]);

  useEffect(() => {
    (() => {
      const savedTheme = localStorage.getItem(LOCAL_STORAGE_THEME_KEY);
      const isDarkMode = savedTheme === "dark";
      document.documentElement.classList.toggle("dark", isDarkMode);

      const validKeys = [
        LOCAL_STORAGE_THEME_KEY,
        LOCAL_STORAGE_TOKEN_KEY,
        LOCAL_STORAGE_USERNAME_KEY,
        LOCAL_STORAGE_LOGIN_KEY,
      ];

      window.addEventListener("storage", (event) => {
        if (validKeys.includes(event.key)) {
          location.reload();
        }
      });
    })();
  }, []);

  const fetchUserData = async (token, storedUsername) => {
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/protected`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.username) {
        if (data.username !== storedUsername) {
          clearAuthState();
          setIsLoggedIn(false);
          setUsername("");
          location.reload();
          return;
        }

        setUsername(data.username);
        setIsLoggedIn(true);
      } else {
        clearAuthState();
        setIsLoggedIn(false);
        setUsername("");
        location.reload();
      }
    } catch (error) {
      location.reload();
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, log me out!",
      cancelButtonText: "No, cancel!",
      confirmButtonColor: "#da4242",
      reverseButtons: true,
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        clearAuthState();
        setIsLoggedIn(false);
        setUsername("");
        location.reload();
      }
    });
  };

  const formatUsername = (username) => {
    if (username.length > 15) {
      return `${username.slice(0, 5)}...${username.slice(-5)}`;
    }
    return username;
  };

  useEffect(() => {
    if (isLoading) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [isLoading]);

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 bg-opacity-50 bg-transparent backdrop-blur-[2px] dark:bg-opacity-70 flex justify-center items-center z-50 overflow-hidden">
          <div className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow-lg dark:bg-gray-800 dark:text-white">
            <FaSpinner className="text-4xl animate-spin" />
            <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Loading...
            </span>
          </div>
        </div>
      )}

      <header className="bg-gray-800 text-white p-4 relative z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link
            to={`${baseUrl}`}
            aria-label="Go to Online IDE homepage"
            className="text-2xl ml-2.5 font-bold tracking-wide hover:text-gray-300 transition-colors duration-200 focus:outline-none"
          >
            Online IDE
          </Link>

          <nav className="hidden md:flex space-x-6">
            {isLoggedIn ? (
              <>
                <Link
                  to={`${baseUrl}/account/${username}`}
                  className="text-lg hover:text-gray-300 transition-colors duration-200 focus:outline-none"
                  title={username.trim()}
                  aria-label={`Go to ${formatUsername(username)}'s account`}
                >
                  {formatUsername(username)}'s Account
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-lg hover:text-gray-300 transition-colors duration-200 cursor-pointer focus:outline-none"
                  disabled={isLoading}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to={`${baseUrl}/login`}
                  className="text-lg hover:text-gray-300 transition-colors duration-200 focus:outline-none"
                  aria-label="Go to Login page"
                >
                  Login
                </Link>
                <Link
                  to={`${baseUrl}/register`}
                  className="text-lg hover:text-gray-300 transition-colors duration-200 focus:outline-none"
                  aria-label="Go to Register page"
                >
                  Register
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="text-xl focus:outline-none p-2 rounded-full cursor-pointer hover:bg-gray-700 transition-colors duration-200"
            >
              {isDarkMode ? (
                <RxMoon className="text-white" />
              ) : (
                <RxSun className="text-white" />
              )}
            </button>

            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="text-xl focus:outline-none p-2 rounded-full hover:bg-gray-700 transition-colors duration-200 md:hidden"
            >
              {!isDropdownOpen ? (
                <FaBarsStaggered className="text-white" />
              ) : (
                <SiIfixit className="text-white" />
              )}
            </button>
          </div>
        </div>

        <nav className="md:hidden mt-4">
          {isDropdownOpen && (
            <div className="space-y-4 mt-4 bg-gray-800 p-4 rounded-md">
              {isLoggedIn ? (
                <>
                  <Link
                    to={`${baseUrl}/account/${username}`}
                    className="block text-lg text-center focus:outline-none hover:text-gray-300"
                    title={username.trim()}
                    aria-label={`Go to ${formatUsername(
                      username
                    )}'s account page`}
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    {formatUsername(username)}'s Account
                  </Link>

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsDropdownOpen(false);
                    }}
                    className="block text-lg text-center focus:outline-none hover:text-gray-300 w-full"
                    disabled={isLoading}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block text-lg text-center focus:outline-none hover:text-gray-300"
                    aria-label="Go to Login page"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block text-lg text-center focus:outline-none hover:text-gray-300"
                    aria-label="Go to Register page"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          )}
        </nav>
      </header>
    </>
  );
};

export default Header;
