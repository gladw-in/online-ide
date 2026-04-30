import os
import re
import jwt
import redis
import requests
import logging
from functools import wraps
from flask import request, jsonify, g
from dotenv import load_dotenv
from urllib.parse import quote

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET")
RECAPTCHA_SECRET_KEY = os.getenv("RECAPTCHA_SECRET_KEY")
RECAPTCHA_THRESHOLD = float(os.getenv("RECAPTCHA_THRESHOLD", "0.5"))
RECAPTCHA_TIMEOUT = float(os.getenv("RECAPTCHA_TIMEOUT", "5"))
TEMP_FILE_URL = os.getenv("TEMP_FILE_URL")

_redis_client = None

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
    "htmlcssjs",
}

_lang_pattern = "|".join(sorted(valid_languages, key=len, reverse=True))

FILE_ID_RE = re.compile(
    rf"^({_lang_pattern})-[0-9a-f]{{8}}-[0-9a-f]{{4}}-4[0-9a-f]{{3}}-[89ab][0-9a-f]{{3}}-[0-9a-f]{{12}}$"
)


def get_redis_connection():
    global _redis_client
    if _redis_client is None:
        redis_host = os.getenv("REDIS_HOST")
        redis_port = os.getenv("REDIS_PORT", "6379")
        redis_password = os.getenv("REDIS_PASSWORD") or ""
        if not redis_password:
            logging.error("REDIS_PASSWORD not set, Redis connection will fail")
        encoded_password = quote(redis_password, safe="")
        redis_url = f"rediss://default:{encoded_password}@{redis_host}:{redis_port}"
        try:
            client = redis.Redis.from_url(
                redis_url,
                socket_connect_timeout=3,
                socket_timeout=3,
                decode_responses=False,
            )
            client.ping()
            _redis_client = client
        except Exception as e:
            logging.error(f"Redis connection failed: {e}")
            _redis_client = None
            return None
    return _redis_client


def is_human(recaptcha_token):
    if not recaptcha_token or not RECAPTCHA_SECRET_KEY:
        return False

    payload = {"secret": RECAPTCHA_SECRET_KEY, "response": recaptcha_token}

    try:
        response = requests.post(
            "https://www.google.com/recaptcha/api/siteverify",
            data=payload,
            timeout=RECAPTCHA_TIMEOUT,
        )
        response.raise_for_status()
        result = response.json()

        score = result.get("score", 0.0)
        if result.get("success") and score >= RECAPTCHA_THRESHOLD:
            return True
        else:
            return False

    except requests.exceptions.Timeout:
        return False
    except requests.exceptions.RequestException:
        return False


def token_required(f):
    @wraps(f)
    def decorator(*args, **kwargs):
        cached = g.get("_cached_jwt", None)
        if cached:
            request.user_data = cached
            return f(*args, **kwargs)

        token = None
        if "Authorization" in request.headers:
            auth_header = request.headers["Authorization"]
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]

        if not token:
            return jsonify({"message": "Token is missing!"}), 403
        try:
            decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS512"])
            request.user_data = decoded
        except jwt.InvalidTokenError:
            return jsonify({"message": "Invalid token!"}), 401
        return f(*args, **kwargs)

    return decorator
