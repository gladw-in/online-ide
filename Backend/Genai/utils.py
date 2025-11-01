import json
import re
import os
import ast
import requests
import jwt
import logging
from datetime import datetime, timezone
from functools import wraps
from flask import request, jsonify
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(module)s - %(message)s"
)

CODE_REGEX = r"```(?:\w+\n)?(.*?)```"
SECRET_KEY = os.getenv("JWT_SECRET")
RECAPTCHA_SECRET_KEY = os.getenv("RECAPTCHA_SECRET_KEY")
MAX_SIZE = int(0.5 * 1024 * 1024)


valid_languages = {
    "python",
    "javascript",
    "rust",
    "mongodb",
    "swift",
    "ruby",
    "dart",
    "perl",
    "scala",
    "julia",
    "go",
    "java",
    "cpp",
    "csharp",
    "c",
    "sql",
    "typescript",
    "kotlin",
    "verilog",
}


def utc_time_reference():
    utc_now = datetime.now(timezone.utc)
    formatted_time = utc_now.strftime("%I:%M:%S %p on %B %d, %Y")
    return f"{formatted_time} UTC time zone"


def validate_json(gemini_output):
    gemini_output = gemini_output.strip()
    if gemini_output.startswith("```json"):
        gemini_output = gemini_output[7:-3].strip()
    elif gemini_output.startswith("```"):
        gemini_output = gemini_output[3:-3].strip()

    try:
        data = json.loads(gemini_output)
    except json.JSONDecodeError:
        logging.warning("JSON decoding failed, attempting ast.literal_eval.")
        try:
            data = ast.literal_eval(gemini_output)
        except Exception as e:
            logging.error(f"ast.literal_eval also failed: {e}")
            return False, None

    for key, value in data.items():
        if not re.match(r"^prompt_\d+$", key):
            logging.warning(f"Invalid key format in JSON data: '{key}'")
            return False, None
        if not isinstance(value, str) or not value.strip():
            logging.warning(f"Invalid value for key '{key}': not a non-empty string.")
            return False, None

    logging.info("Successfully validated JSON data.")
    return True, data


def is_human(recaptcha_token):
    if not recaptcha_token or not RECAPTCHA_SECRET_KEY:
        logging.warning("reCAPTCHA check failed: Token or secret key is missing.")
        return False

    payload = {"secret": RECAPTCHA_SECRET_KEY, "response": recaptcha_token}

    try:
        response = requests.post(
            "https://www.google.com/recaptcha/api/siteverify", data=payload, timeout=50
        )
        response.raise_for_status()
        result = response.json()

        if result.get("success") and result.get("score", 0) > 0.5:
            logging.info(
                f"reCAPTCHA verification successful. Score: {result.get('score')}"
            )
            return True
        else:
            logging.warning(f"reCAPTCHA verification failed. Result: {result}")
            return False

    except requests.exceptions.RequestException as e:
        logging.error(f"reCAPTCHA request to Google failed: {e}")
        return False


def token_required(f):
    @wraps(f)
    def decorator(*args, **kwargs):
        token = None
        if "Authorization" in request.headers:
            auth_header = request.headers["Authorization"]
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]

        if not token:
            logging.warning("Access attempt without a token.")
            return jsonify({"message": "Token is missing!"}), 403

        try:
            decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS512"])
            request.user = decoded
            logging.info("Token successfully decoded.")
        except jwt.InvalidTokenError as e:
            logging.warning(f"Invalid token received: {e}")
            return jsonify({"message": "Invalid token!"}), 401

        return f(*args, **kwargs)

    return decorator
