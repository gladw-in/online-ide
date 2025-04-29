import React, { useEffect, useRef } from "react";

const OtpInputForm = ({ onOtpChange }) => {
  const otpInputs = useRef([]);

  useEffect(() => {
    const filledInput = otpInputs.current.find(
      (input) => input.value.trim() !== ""
    );
    if (filledInput) {
      filledInput.focus();
    } else {
      otpInputs.current[0].focus();
    }
  }, []);

  const handleInputChange = (e, index) => {
    const value = e.target.value;
    if (value.length === 1) {
      if (index === 5) {
        return;
      } else {
        otpInputs.current[index + 1].focus();
      }
    }
    const otpValue = otpInputs.current.map((input) => input.value).join("");
    onOtpChange(otpValue);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && otpInputs.current[index].value === "") {
      if (index > 0) {
        otpInputs.current[index - 1].focus();
      }
    }

    if (e.key === "ArrowRight" && index < otpInputs.current.length - 1) {
      otpInputs.current[index + 1].focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      otpInputs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim();
    const pasteArray = pasteData.split("").slice(0, 6);

    pasteArray.forEach((char, i) => {
      if (otpInputs.current[i]) {
        otpInputs.current[i].value = char;
      }
    });

    const nextIndex =
      pasteArray.length < otpInputs.current.length
        ? pasteArray.length
        : otpInputs.current.length - 1;
    otpInputs.current[nextIndex].focus();

    const otpValue = otpInputs.current.map((input) => input.value).join("");
    onOtpChange(otpValue);
  };

  const handleBlur = () => {
    const otpValue = otpInputs.current.map((input) => input.value).join("");
    onOtpChange(otpValue);
  };

  return (
    <div className="flex justify-center space-x-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <input
          key={index}
          type="text"
          maxLength="1"
          ref={(el) => (otpInputs.current[index] = el)}
          className="w-12 h-12 text-center text-xl border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-400"
          onChange={(e) => handleInputChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          onBlur={handleBlur}
          required
        />
      ))}
    </div>
  );
};

export default OtpInputForm;
