import json
import re
import os
import ast
import requests
import jwt
from datetime import datetime, timezone
from functools import wraps
from flask import request, jsonify, g
from dotenv import load_dotenv

load_dotenv()

CODE_REGEX = r"```(?:\w+\n)?(.*?)```"
SECRET_KEY = os.getenv("JWT_SECRET")
RECAPTCHA_SECRET_KEY = os.getenv("RECAPTCHA_SECRET_KEY")


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
        try:
            data = ast.literal_eval(gemini_output)
        except:
            return False, None

    for key, value in data.items():
        if not re.match(r"^prompt_\d+$", key):
            return False, None
        if not isinstance(value, str) or not value.strip():
            return False, None

    return True, data


def is_human(recaptcha_token):
    if not recaptcha_token or not RECAPTCHA_SECRET_KEY:
        return False

    payload = {"secret": RECAPTCHA_SECRET_KEY, "response": recaptcha_token}

    try:
        response = requests.post(
            "https://www.google.com/recaptcha/api/siteverify", data=payload, timeout=50
        )
        response.raise_for_status()
        result = response.json()

        if result.get("success") and result.get("score", 0) > 0.5:
            return True
        else:
            return False

    except requests.exceptions.RequestException:
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
            return jsonify({"message": "Token is missing!"}), 403

        try:
            decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS512"])
            g.user = decoded
        except jwt.InvalidTokenError as e:
            return jsonify({"message": "Invalid token!"}), 401

        return f(*args, **kwargs)

    return decorator
