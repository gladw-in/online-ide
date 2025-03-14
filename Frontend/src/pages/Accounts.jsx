import React, { useState, useEffect } from "react";
import InputField from "../utils/InputField";
import {
  SESSION_STORAGE_SHARELINKS_KEY,
  LOCAL_STORAGE_TOKEN_KEY,
  LOCAL_STORAGE_USERNAME_KEY,
  LOCAL_STORAGE_LOGIN_KEY,
  BACKEND_API_URL,
} from "../utils/constants";
import { useNavigate } from "react-router-dom";
import { TbLoader } from "react-icons/tb";
import Swal from "sweetalert2/dist/sweetalert2.js";

const Accounts = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    newPassword: "",
    confirmPassword: "",
    currentPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [btnState, setBtnState] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Accounts";
    fetchUserData();
  }, []);

  const clearSession = () => {
    localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
    localStorage.removeItem(LOCAL_STORAGE_USERNAME_KEY);
    localStorage.removeItem(LOCAL_STORAGE_LOGIN_KEY);
    sessionStorage.removeItem(SESSION_STORAGE_SHARELINKS_KEY);
  };

  const fetchUserData = async () => {
    const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
    if (!token) {
      navigate("/login");
      location.reload();
      return;
    }

    try {
      const response = await fetch(
        `${BACKEND_API_URL}/api/protected?email=true`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setFormData((prevData) => ({
          ...prevData,
          username: data.username,
          email: data.email,
        }));
      } else {
        setErrorMessage(data.msg || "Failed to fetch user data");
      }
    } catch (error) {
      setErrorMessage("Failed to fetch user data");
    }
  };

  const handlePasswordVerification = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
    if (!token) {
      navigate("/login");
      location.reload();
      return;
    }

    const { currentPassword } = formData;

    try {
      setBtnState(true);

      const response = await fetch(`${BACKEND_API_URL}/api/verify-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: currentPassword }),
      });

      const data = await response.json();
      if (response.ok) {
        setIsPasswordVerified(true);
        setErrorMessage("");
      } else {
        setErrorMessage(data.msg || "Password verification failed.");
      }
    } catch (error) {
      setErrorMessage("Error verifying password.");
    } finally {
      setBtnState(false);
    }
  };

  const handleUpdateUsername = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
    if (!token) {
      navigate("/login");
      location.reload();
      return;
    }

    if (!isPasswordVerified) {
      setErrorMessage("Please verify your password first.");
      return;
    }

    const { username } = formData;

    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to update your username?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, update it!",
      cancelButtonText: "No, keep it",
      allowOutsideClick: false,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(
            `${BACKEND_API_URL}/api/change-username`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ newUsername: username }),
            }
          );

          const data = await response.json();
          if (response.ok) {
            localStorage.setItem(LOCAL_STORAGE_USERNAME_KEY, username);
            Swal.fire({
              title: "Updated!",
              text: "Your username has been updated successfully.",
              icon: "success",
            }).then(() => {
              navigate("/accounts");
              location.reload();
            });
            fetchUserData();
          } else {
            setErrorMessage(data.msg || "Failed to update username");
          }
        } catch (error) {
          setErrorMessage("Error updating username");
        }
      }
    });
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
    if (!token) {
      navigate("/login");
      location.reload();
      return;
    }

    if (!isPasswordVerified) {
      setErrorMessage("Please verify your password first.");
      return;
    }

    const { email } = formData;

    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to update your email?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, update it!",
      cancelButtonText: "No, keep it",
      allowOutsideClick: false,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`${BACKEND_API_URL}/api/change-email`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ newEmail: email }),
          });

          const data = await response.json();
          if (response.ok) {
            Swal.fire({
              title: "Updated!",
              text: "Your email has been updated successfully.",
              icon: "success",
            }).then(() => {
              navigate("/accounts");
              location.reload();
            });
            fetchUserData();
          } else {
            setErrorMessage(data.msg || "Failed to update email");
          }
        } catch (error) {
          setErrorMessage("Error updating email");
        }
      }
    });
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (!isPasswordVerified) {
      setErrorMessage("Please verify your password first.");
      return;
    }

    const { newPassword, confirmPassword } = formData;

    if (!newPassword || !confirmPassword) {
      setErrorMessage("New password and confirm password are required.");
      return;
    }

    if (newPassword.length < 8 || confirmPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("New password and confirm password do not match.");
      return;
    }

    const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
    if (!token) {
      navigate("/login");
      location.reload();
      return;
    }

    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to update your password?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, update it!",
      cancelButtonText: "No, keep it",
      allowOutsideClick: false,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(
            `${BACKEND_API_URL}/api/change-password`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ newPassword, confirmPassword }),
            }
          );

          const data = await response.json();

          if (response.ok) {
            Swal.fire({
              title: "Updated!",
              text: "Your password has been updated successfully.",
              icon: "success",
            }).then(() => {
              navigate("/accounts");
              location.reload();
            });

            setFormData({
              username: "",
              email: "",
              password: "",
              newPassword: "",
              confirmPassword: "",
              currentPassword: "",
            });

            clearSession();

            navigate("/login");
            location.reload();
          } else {
            setErrorMessage(data.msg || "Failed to update password");
          }
        } catch (error) {
          setErrorMessage("Error updating password");
        }
      }
    });
  };

  const handleDeleteAccount = async () => {
    if (!isPasswordVerified) {
      setErrorMessage("Please verify your password first.");
      return;
    }

    Swal.fire({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover your account!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, keep it",
      confirmButtonColor: "#da4242",
      allowOutsideClick: false,
    }).then(async (result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
        if (!token) {
          navigate("/");
          location.reload();
          return;
        }

        try {
          const response = await fetch(`${BACKEND_API_URL}/api/account`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await response.json();
          if (response.ok) {
            clearSession();

            Swal.fire({
              title: "Deleted!",
              text: "Your account has been deleted.",
              icon: "success",
              timer: 1500,
            }).then(() => {
              navigate("/");
              location.reload();
            });
          } else {
            setErrorMessage(data.msg || "Failed to delete account");
          }
        } catch (error) {
          setErrorMessage("Error deleting account");
        }
      }
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (errorMessage) {
      setErrorMessage("");
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 p-4 bg-white rounded-lg shadow-md dark:bg-gray-800 dark:text-white">
      <h2 className="text-xl font-semibold text-center">Account Settings</h2>
      {errorMessage && (
        <p className="text-red-500 text-center">{errorMessage}</p>
      )}

      {!isPasswordVerified && (
        <form onSubmit={handlePasswordVerification}>
          <InputField
            label="Enter Current Password"
            type="password"
            value={formData.currentPassword}
            onChange={handleInputChange}
            required
            name="currentPassword"
            showPassword={showCurrentPassword}
            togglePasswordVisibility={() =>
              setShowCurrentPassword(!showCurrentPassword)
            }
          />
          <button
            type="submit"
            className="w-full p-2 text-sm bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700 focus:outline-none transition duration-300 dark:bg-blue-500 dark:hover:bg-blue-400 ease-in-out transform hover:scale-x-95 hover:shadow-lg"
          >
            {btnState ? (
              <>
                <TbLoader className="animate-spin text-xl inline-block mr-1" />{" "}
                Verifying...
              </>
            ) : (
              "Verify Password"
            )}
          </button>

          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            <button
              onClick={() => navigate("/forgot-password")}
              className="text-blue-600 cursor-pointer dark:text-blue-400 hover:underline"
            >
              Forgot Password?
            </button>
          </p>
        </form>
      )}

      {isPasswordVerified && (
        <div>
          <form onSubmit={handleUpdateUsername}>
            <InputField
              label="Username"
              type="text"
              value={formData.username}
              onChange={handleInputChange}
              required
              name="username"
            />
            <button
              type="submit"
              className="w-full p-2 text-sm bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700 focus:outline-none transition duration-300 dark:bg-blue-500 dark:hover:bg-blue-400 ease-in-out transform hover:scale-x-95 hover:shadow-lg"
            >
              Update Username
            </button>
          </form>

          <form onSubmit={handleUpdateEmail}>
            <InputField
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              name="email"
            />
            <button
              type="submit"
              className="w-full p-2 text-sm bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700 focus:outline-none transition duration-300 dark:bg-blue-500 dark:hover:bg-blue-400 ease-in-out transform hover:scale-x-95 hover:shadow-lg"
            >
              Update Email
            </button>
          </form>

          <form onSubmit={handleUpdatePassword}>
            <InputField
              label="New Password"
              type="password"
              value={formData.newPassword}
              onChange={handleInputChange}
              name="newPassword"
              showPassword={showNewPassword}
              togglePasswordVisibility={() =>
                setShowNewPassword(!showNewPassword)
              }
            />
            <InputField
              label="Confirm New Password"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              name="confirmPassword"
              showPassword={showConfirmPassword}
              togglePasswordVisibility={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
            />
            <button
              type="submit"
              className="w-full p-2 text-sm bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700 focus:outline-none transition duration-300 dark:bg-blue-500 dark:hover:bg-blue-400 ease-in-out transform hover:scale-x-95 hover:shadow-lg"
            >
              Update Password
            </button>
          </form>
        </div>
      )}

      {isPasswordVerified && (
        <div className="mt-4 text-center">
          <button
            onClick={handleDeleteAccount}
            className="w-full p-2 text-sm bg-red-500 text-white rounded-md cursor-pointer hover:bg-red-600 focus:outline-none transition duration-300 dark:bg-red-600 dark:hover:bg-red-500 ease-in-out transform hover:scale-x-95 hover:shadow-lg"
          >
            Delete Account
          </button>
        </div>
      )}
    </div>
  );
};

export default Accounts;
