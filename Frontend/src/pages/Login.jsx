import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { TbLoader } from "react-icons/tb";
import InputField from "../utils/InputField";
import { apiFetch } from "../utils/apifetch";
import {
  SESSION_STORAGE_SHARELINKS_KEY,
  LOCAL_STORAGE_TOKEN_KEY,
  LOCAL_STORAGE_USERNAME_KEY,
  LOCAL_STORAGE_LOGIN_KEY,
  BACKEND_API_URL,
  EMAIL_REGEX,
  PASSWORD_REGEX,
  LOCAL_STORAGE_GOOGLE_USER,
} from "../utils/constants";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [googleLoginError, setGoogleLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Login";
  }, []);

  const handleAuthSuccess = (data) => {
    localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, data.token);
    localStorage.setItem(LOCAL_STORAGE_USERNAME_KEY, data.username);
    localStorage.setItem(LOCAL_STORAGE_LOGIN_KEY, "true");
    localStorage.setItem(LOCAL_STORAGE_GOOGLE_USER, data.isgoogleuser);
    sessionStorage.removeItem(SESSION_STORAGE_SHARELINKS_KEY);
    navigate(window.history.length > 2 ? -1 : "/");
    location.reload();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (error || googleLoginError) {
      setError("");
      setGoogleLoginError("");
    }
  };

  const validateForm = () => {
    if (!EMAIL_REGEX.test(formData.email.trim())) {
      setError("Invalid email format");
      return false;
    }
    if (formData.password.trim().length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    if (!PASSWORD_REGEX.test(formData.password.trim())) {
      setError("Invalid password format");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    if (error || googleLoginError) {
      setError("");
      setGoogleLoginError("");
    }

    try {
      const response = await apiFetch(`${BACKEND_API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        if (data.msg === "Email not verified") {
          setError(
            "Email is not verified. Please check your inbox or register again."
          );
        } else {
          setError(data.msg || "Invalid credentials!");
        }
        return;
      }
      handleAuthSuccess(data);
    } catch (err) {
      setError(err.message || "Server error, please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    setLoading(true);

    if (error || googleLoginError) {
      setError("");
      setGoogleLoginError("");
    }

    try {
      const idToken = credentialResponse.credential;
      const response = await apiFetch(`${BACKEND_API_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: idToken }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error("Google authentication failed.");
      }
      handleAuthSuccess(data);
    } catch (err) {
      setGoogleLoginError("Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginError = () => {
    setGoogleLoginError("Google login failed. Please try again.");
  };

  return (
    <div className="flex items-center justify-center min-h-[80dvh] bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-semibold text-center text-gray-700 dark:text-gray-200 mb-6">
          Login
        </h2>
        <form onSubmit={handleSubmit}>
          <InputField
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          <InputField
            label="Password"
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword((prev) => !prev)}
          />

          {error && (
            <p className="text-red-600 dark:text-red-400 text-center mb-4">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3 cursor-pointer text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none transition duration-300 dark:bg-blue-500 dark:hover:bg-blue-400 ease-in-out transform hover:scale-x-95 hover:shadow-lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <TbLoader className="animate-spin text-xl inline-block mr-1" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
          <span className="flex-shrink mx-4 text-gray-500 dark:text-gray-400">
            OR
          </span>
          <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={handleGoogleLoginError}
            theme="outline"
            shape="square"
            scope="profile email"
            text="continue_with"
            useOneTap
          />
        </div>

        {googleLoginError && (
          <p className="text-red-600 dark:text-red-400 text-center my-4">
            {googleLoginError}
          </p>
        )}

        <div className="mt-5 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-blue-600 cursor-pointer dark:text-blue-400 hover:underline"
            >
              Register here
            </button>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            <button
              onClick={() => navigate("/forgot-password")}
              className="text-blue-600 cursor-pointer dark:text-blue-400 hover:underline"
            >
              Forgot Password
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
