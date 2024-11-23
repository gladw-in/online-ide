import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSun,
  faMoon,
  faBars,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2/dist/sweetalert2.js";
import "sweetalert2/src/sweetalert2.scss";

const Header = ({ isDarkMode, toggleTheme }) => {
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUserData(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserData = async (token) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/api/protected`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (data.user) {
        setUsername(data.user.username);
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        sessionStorage.removeItem("token");
        navigate("/login");
        location.reload();
      }
    } catch (error) {
      setIsLoggedIn(false);
      sessionStorage.removeItem("token");
      navigate("/login");
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
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        setUsername("");
        navigate(-1);
        location.reload();
      }
    });
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex justify-center items-center z-50 overflow-hidden">
          <div className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow-lg dark:bg-gray-800 dark:text-white">
            <FontAwesomeIcon icon={faSpinner} spin className="text-4xl" />
            <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Loading...
            </span>
          </div>
        </div>
      )}
      <header className="bg-gray-800 text-white p-4 relative z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link
            to="/"
            className="text-2xl font-bold tracking-wide hover:text-gray-300 transition-colors duration-200"
          >
            Online IDE
          </Link>

          <nav className="hidden md:flex space-x-6">
            {isLoggedIn ? (
              <>
                <Link
                  to="/accounts"
                  className="text-lg hover:text-gray-300 transition-colors duration-200"
                >
                  {username}'s Account
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-lg hover:text-gray-300 transition-colors duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-lg hover:text-gray-300 transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-lg hover:text-gray-300 transition-colors duration-200"
                >
                  Register
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="text-xl focus:outline-none p-2 rounded-full hover:bg-gray-700 transition-colors duration-200"
            >
              <FontAwesomeIcon
                icon={isDarkMode ? faSun : faMoon}
                className="text-white"
              />
            </button>

            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="text-xl focus:outline-none p-2 rounded-full hover:bg-gray-700 transition-colors duration-200 md:hidden"
            >
              <FontAwesomeIcon icon={faBars} className="text-white" />
            </button>
          </div>
        </div>

        <nav className="md:hidden mt-4">
          {isDropdownOpen && (
            <div className="space-y-4 mt-4 bg-gray-800 p-4 rounded-md">
              {isLoggedIn ? (
                <>
                  <Link
                    to="/accounts"
                    className="block text-lg text-center hover:text-gray-300"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    {username}'s Account
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsDropdownOpen(false);
                    }}
                    className="block text-lg text-center hover:text-gray-300 w-full"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block text-lg text-center hover:text-gray-300"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block text-lg text-center hover:text-gray-300"
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
