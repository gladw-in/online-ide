import { useState } from "react";
import { useNavigate } from "react-router-dom";

const InputField = ({
  label,
  type,
  value,
  onChange,
  required,
  name,
  showPassword,
  onTogglePassword,
}) => (
  <div className="mb-4 relative">
    <label
      htmlFor={name}
      className="block text-gray-600 dark:text-gray-300 font-medium mb-2"
    >
      {label} <span className="text-red-600">*</span>
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
    />
    {name === "password" && (
      <button
        type="button"
        className="absolute right-3 top-[70%] transform -translate-y-1/2 text-gray-500 dark:text-gray-300"
        onClick={onTogglePassword}
      >
        {showPassword ? "Hide" : "Show"}
      </button>
    )}
  </div>
);

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const usernameRegex = /^[a-zA-Z0-9_.-]{5,30}$/;
  const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

  const navigate = useNavigate();

  document.title = "Register";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const validateForm = () => {
    if (!emailRegex.test(formData.email)) {
      setError("Invalid email format");
      return false;
    }

    if (!usernameRegex.test(formData.username)) {
      setError(
        "Username can only contain letters, numbers, underscores, hyphens, and periods (5-30 characters)."
      );
      return false;
    }

    if (formData.username.length < 5 || formData.username.length > 30) {
      setError("Username should be between 5 and 30 characters");
      return false;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    const { username, email, password } = formData;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/api/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            email,
            password,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Server error, please try again.");
      }

      navigate("/login");
      location.reload();
    } catch (err) {
      setError(err.message || "Server error, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-semibold text-center text-gray-700 dark:text-gray-200 mb-6">
          Register
        </h2>
        <form onSubmit={handleSubmit}>
          <InputField
            label="Username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            required
          />

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
            className="w-full py-3 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none transition duration-300 dark:bg-blue-500 dark:hover:bg-blue-400 ease-in-out transform hover:scale-x-95 hover:shadow-lg"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
