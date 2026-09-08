# Holds the app's settings and limits, like file size and redis details.
import os
from urllib.parse import quote

from dotenv import load_dotenv

load_dotenv()

MAX_CONTENT_LENGTH = 600 * 1024
MAX_CODE_SIZE_BYTES = 512000

MAX_CODE_BYTES = int(os.getenv("MAX_CODE_BYTES", 102_400))
MAX_FILES = int(os.getenv("MAX_FILES", "50"))
MAX_OUTPUT_BYTES = int(os.getenv("MAX_OUTPUT_BYTES", 524_288))

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*")
CORS_ALLOW_HEADERS = [
    "Authorization",
    "Content-Type",
    "X-Recaptcha-Token",
    "X-Request-ID",
    "X-File-ID",
]

REDIS_HOST = os.getenv("REDIS_HOST")
REDIS_PORT = os.getenv("REDIS_PORT", "6379")
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD")

if REDIS_HOST and REDIS_PASSWORD:
    _encoded_password = quote(REDIS_PASSWORD, safe="")
    REDIS_URL = f"rediss://default:{_encoded_password}@{REDIS_HOST}:{REDIS_PORT}/0"
else:
    REDIS_URL = None

if not REDIS_URL:
    raise RuntimeError(
        "REDIS_URL is required for distributed rate limiting."
    )

RATELIMIT_STORAGE_URI = REDIS_URL
RATELIMIT_KEY_PREFIX = "onlineIdeTempFile"
RATELIMIT_STORAGE_OPTIONS = {
    "socket_connect_timeout": 5,
    "socket_timeout": 5,
    "health_check_interval": 15,
    "retry_on_timeout": True,
}

VALID_EXPIRY_TIMES = (10, 30, 60, 1440, 10080)
PORT = int(os.getenv("PORT", 5000))
