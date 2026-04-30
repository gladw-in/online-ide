import json
import re
import os
import requests
import jwt
import logging
from datetime import datetime, timezone
from functools import wraps
from flask import request, jsonify
from dotenv import load_dotenv

load_dotenv()

CODE_REGEX = r"```(?:\w+\n)?(.*?)```"
MAX_PROMPT_CHARS = 2000
MAX_CODE_SIZE_BYTES = int(os.getenv("MAX_CODE_SIZE_BYTES", str(512 * 1024)))
RECAPTCHA_MIN_SCORE = float(os.getenv("RECAPTCHA_MIN_SCORE", "0.5"))
RECAPTCHA_TIMEOUT = float(os.getenv("RECAPTCHA_TIMEOUT", "3.0"))
MAX_CODE_SCAN_CHARS = 131072

CODE_INJECTION_PATTERNS = [
    r"ignore\s+all\s+previous\s+instructions",
    r"jailbreak",
]

PROMPT_INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?previous\s+instructions",
    r"system\s+prompt",
    r"jailbreak",
    r"\bDAN\b",
    r"you\s+are\s+now\s+",
    r"new\s+task\s*:",
    r"disregard",
]

VALID_LANGUAGES = {
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

SECRET_KEY = os.getenv("JWT_SECRET")
RECAPTCHA_SECRET_KEY = os.getenv("RECAPTCHA_SECRET_KEY")


def sanitize_prompt_input(text, max_chars=MAX_PROMPT_CHARS, is_code=False):
    if not isinstance(text, str):
        raise ValueError("Input must be a string")

    patterns = CODE_INJECTION_PATTERNS if is_code else PROMPT_INJECTION_PATTERNS
    scan_len = MAX_CODE_SCAN_CHARS if is_code else max_chars

    if not is_code:
        text = text[:max_chars]

    sample = text[:scan_len]

    for pat in patterns:
        if re.search(pat, sample, re.IGNORECASE):
            logging.warning(f"Injection blocked: pattern={pat!r}")
            raise ValueError("Invalid input detected")

    return text


def utc_time_reference():
    utc_now = datetime.now(timezone.utc)
    formatted_time = utc_now.strftime("%I:%M:%S %p on %B %d, %Y")
    return f"{formatted_time} UTC time zone"


def validate_json(gemini_output):
    text = gemini_output.strip()
    m = re.match(r"^```(?:json)?\s*\n?(.*?)\n?```\s*$", text, re.DOTALL)
    if m:
        cleaned = m.group(1).strip()
    else:
        cleaned = text

    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError as e:
        logging.error(f"JSON parse failed: {e}. Output[:200]: {cleaned[:200]}")
        return False, None

    if not isinstance(data, dict):
        return False, None

    for k, v in data.items():
        if not re.match(r"^prompt_\d+$", k):
            return False, None

        if not isinstance(v, str) or not v.strip():
            return False, None

    return True, data


def is_human(token):
    if not token or not RECAPTCHA_SECRET_KEY:
        logging.warning("reCAPTCHA: missing token or secret")
        return False

    try:
        r = requests.post(
            "https://www.google.com/recaptcha/api/siteverify",
            data={"secret": RECAPTCHA_SECRET_KEY, "response": token},
            timeout=(1.5, RECAPTCHA_TIMEOUT),
        )

        r.raise_for_status()
        res = r.json()
        score = res.get("score", 0)

        if res.get("success") and score >= RECAPTCHA_MIN_SCORE:
            logging.info(f"reCAPTCHA OK score={score}")
            return True

        logging.warning(
            f'reCAPTCHA rejected score={score}, success={res.get("success")}'
        )

        return False
    except requests.exceptions.RequestException as e:
        logging.error(f"reCAPTCHA request failed: {e}")
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
