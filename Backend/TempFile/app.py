import os
import jwt
import uuid
import json
import redis
import ipaddress
from flask import Flask, abort, request, jsonify, render_template, redirect, url_for, g
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from werkzeug.middleware.proxy_fix import ProxyFix
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
import logging
import uuid as _uuid
from urllib.parse import quote
from utils import (
    token_required,
    is_human,
    get_redis_connection,
    valid_languages,
    SECRET_KEY,
    TEMP_FILE_URL,
    FILE_ID_RE,
)

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)-8s %(module)s - %(message)s",
)

app = Flask(__name__)

app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

app.config["MAX_CONTENT_LENGTH"] = 600 * 1024

CORS(
    app,
    origins=os.getenv("ALLOWED_ORIGINS", "*"),
    allow_headers=[
        "Authorization",
        "Content-Type",
        "X-Recaptcha-Token",
        "X-Request-ID",
        "X-File-ID",
    ],
)

redis_host = os.getenv("REDIS_HOST")
redis_port = os.getenv("REDIS_PORT", "6379")
redis_password = os.getenv("REDIS_PASSWORD")
if redis_host and redis_password:
    encoded_password = quote(redis_password, safe="")
    REDIS_URL = f"rediss://default:{encoded_password}@{redis_host}:{redis_port}/0"
else:
    REDIS_URL = None

if not REDIS_URL:
    raise RuntimeError(
        "REDIS_URL is required for distributed rate limiting. Check REDIS_HOST, REDIS_PORT, REDIS_PASSWORD."
    )

app.config["RATELIMIT_STORAGE_URI"] = REDIS_URL or "memory://"

app.config["RATELIMIT_KEY_PREFIX"] = "onlineIdeTempFile"

app.config["RATELIMIT_STORAGE_OPTIONS"] = {
    "socket_connect_timeout": 5,
    "socket_timeout": 5,
    "health_check_interval": 15,
    "retry_on_timeout": True,
}


def _rate_limit_key():
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header.split(" ", 1)[1]

        try:
            decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS512"])
            if decoded.get("sub"):
                g._cached_jwt = decoded
                return f"user:{decoded['sub']}"
        except Exception:
            pass

    xff = request.headers.get("X-Forwarded-For", "")
    ips = [ip.strip() for ip in xff.split(",") if ip.strip()]

    for ip in reversed(ips):
        try:
            addr = ipaddress.ip_address(ip)
            if not addr.is_private:
                return f"ip:{ip}"
        except ValueError:
            continue

    return f"ip:{get_remote_address()}"


limiter = Limiter(
    app=app,
    key_func=_rate_limit_key,
    default_limits=["200 per day", "50 per hour"],
    on_breach=lambda limit: logging.warning(f"Rate limit hit: {limit}"),
)


@app.before_request
def attach_request_id():
    g.request_id = request.headers.get("X-Request-ID", str(_uuid.uuid4()))


@app.after_request
def add_request_id_header(response):
    response.headers["X-Request-ID"] = g.get("request_id", "-")
    return response


@app.after_request
def add_security_headers(response):
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Permissions-Policy"] = "geolocation=(), camera=(), microphone=()"

    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "frame-ancestors 'none'; "
        "object-src 'none'; "
        "base-uri 'self';"
    )

    response.headers["Strict-Transport-Security"] = "max-age=31536000"

    return response


@app.route("/", methods=["GET"])
def index():
    logging.info(f"[{g.request_id}] Serving index page.")
    return render_template("index.html")


@app.route("/temp-file-upload", methods=["POST"])
@limiter.limit("10 per minute")
@token_required
def upload_file():
    logging.info(f"[{g.request_id}] Received request to /temp-file-upload")
    token = request.headers.get("X-Recaptcha-Token")

    if not is_human(token):
        logging.warning(
            f"[{g.request_id}] reCAPTCHA verification failed for upload request."
        )
        abort(403, description="reCAPTCHA verification failed.")

    redis_client = get_redis_connection()
    if not redis_client:
        logging.error(f"[{g.request_id}] Could not connect to Redis.")
        return jsonify({"error": "Service temporarily unavailable"}), 503

    try:
        ct = request.content_type or ""
        if "application/json" not in ct:
            return jsonify({"error": "Content-Type must be application/json"}), 415

        data = request.get_json(silent=True)
        if data is None:
            return jsonify({"error": "Request body must be valid JSON"}), 400

        if (
            not data.get("code")
            or not data.get("language")
            or not data.get("title")
            or not data.get("expiryTime")
        ):
            logging.warning(f"[{g.request_id}] Upload request missing required fields.")
            return (
                jsonify(
                    {"error": "Code, language, title, and expiry time are required"}
                ),
                400,
            )

        valid_expiry_times = (10, 30, 60, 1440, 10080)
        try:
            expiry_time_minutes = int(data["expiryTime"])
        except (TypeError, ValueError):
            return jsonify({"error": "expiryTime must be an integer (minutes)"}), 400

        if expiry_time_minutes not in valid_expiry_times:
            logging.warning(
                f"[{g.request_id}] Invalid expiry time received: {expiry_time_minutes}"
            )
            return (
                jsonify({"error": "Invalid expiry time. Please choose a valid value."}),
                400,
            )

        if not isinstance(data.get("title"), str):
            return jsonify({"error": "title must be a string"}), 400

        if not isinstance(data.get("language"), str):
            return jsonify({"error": "language must be a string"}), 400

        code = data["code"]
        language = data["language"].strip().lower()
        title = data["title"][:200].strip()

        if not title:
            return jsonify({"error": "title cannot be blank or whitespace-only"}), 400

        if language not in valid_languages:
            logging.warning(f"[{g.request_id}] Unsupported language: {language}")
            return (
                jsonify({"error": f"Unsupported language."}),
                400,
            )

        if len(code) > 512000:
            logging.warning(f"[{g.request_id}] Payload too large rejected.")
            return jsonify({"error": "Code exceeds maximum allowed size (500KB)."}), 413

        current_time = datetime.now(timezone.utc)
        expiry_time = current_time + timedelta(minutes=expiry_time_minutes)
        formatted_expiry_time = expiry_time.strftime("%Y-%m-%d %H:%M:%S UTC")

        file_id = str(uuid.uuid4())

        file_data = {
            "title": title,
            "code": code,
            "language": language,
            "expiry_time": formatted_expiry_time,
        }

        redis_client.set(
            f"file:{language}-{file_id}:data",
            json.dumps(file_data),
            ex=expiry_time_minutes * 60,
        )

        file_url = f"{TEMP_FILE_URL}/file/{language}-{file_id}"

        logging.info(f"[{g.request_id}] Successfully created file {language}-{file_id}")

        return jsonify(
            {
                "message": "Code uploaded successfully",
                "fileUrl": file_url,
                "expiry_time": formatted_expiry_time,
            }
        )

    except redis.RedisError as e:
        logging.error(f"[{g.request_id}] Redis error during file upload: {e}")
        return jsonify({"error": "Failed to store code in Redis"}), 500
    except Exception as e:
        logging.error(f"[{g.request_id}] Unexpected error during file upload: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500


@app.route("/file/<shareId>", methods=["GET"])
@limiter.limit("60 per minute")
def get_file(shareId):
    safe_share_id = shareId[:80]
    if not FILE_ID_RE.match(safe_share_id):
        logging.warning(f"[{g.request_id}] Invalid shareId format (sanitised)")
        return jsonify({"error": "Invalid file identifier"}), 400

    shareId = safe_share_id
    logging.info(f"[{g.request_id}] Received request to get file: {shareId}")

    redis_client = get_redis_connection()
    if not redis_client:
        logging.error(f"[{g.request_id}] Could not connect to Redis.")
        return jsonify({"error": "Service temporarily unavailable"}), 503

    try:
        header_shareId = request.headers.get("X-File-ID")

        if not header_shareId or header_shareId != shareId:
            logging.warning(
                f"[{g.request_id}] Redirecting unauthorized access attempt for file: {shareId}"
            )
            return redirect(url_for("index"))

        language, file_id = shareId.split("-", 1)
        file_key = f"file:{language}-{file_id}:data"
        file_data = redis_client.get(file_key)

        if file_data is None:
            logging.info(f"[{g.request_id}] Key not found or expired: {file_key}")
            return jsonify({"error": "File not found or has expired"}), 404

        logging.info(f"[{g.request_id}] Successfully retrieved file: {file_key}")
        file_data = json.loads(file_data)
        return jsonify(file_data), 200

    except redis.RedisError as e:
        logging.error(f"[{g.request_id}] Redis error during file retrieval: {e}")
        return jsonify({"error": "Failed to retrieve code from Redis"}), 500
    except Exception as e:
        logging.error(f"[{g.request_id}] Unexpected error during file retrieval: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500


@app.route("/file/<file_id>/delete", methods=["DELETE"])
@limiter.limit("10 per minute")
@token_required
def delete_file(file_id):
    logging.info(f"[{g.request_id}] Received request to delete file: {file_id}")
    token = request.headers.get("X-Recaptcha-Token")

    if not is_human(token):
        logging.warning(
            f"[{g.request_id}] reCAPTCHA verification failed for delete request."
        )
        abort(403, description="reCAPTCHA verification failed.")

    safe_id = file_id[:80]
    if not FILE_ID_RE.match(safe_id):
        logging.warning(f"[{g.request_id}] Invalid file_id format (sanitised)")
        return jsonify({"error": "Invalid file identifier"}), 400

    language, uuid_part = safe_id.split("-", 1)
    file_key = f"file:{language}-{uuid_part}:data"

    redis_client = get_redis_connection()
    if not redis_client:
        logging.error(f"[{g.request_id}] Could not connect to Redis.")
        return jsonify({"error": "Service temporarily unavailable"}), 503

    try:
        deleted_count = redis_client.delete(file_key)
        if deleted_count == 1:
            logging.info(f"[{g.request_id}] Successfully deleted file: {file_key}")
            return jsonify({"message": "File deleted successfully"}), 200
        else:
            logging.warning(f"[{g.request_id}] Delete target not found: {file_key}")
            return jsonify({"error": "File not found or already expired"}), 404

    except redis.RedisError as e:
        logging.error(f"[{g.request_id}] Redis error during file deletion: {e}")
        return jsonify({"error": "Failed to delete file from Redis"}), 500
    except Exception as e:
        logging.error(f"[{g.request_id}] Unexpected error during file deletion: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(debug=True, host="127.0.0.1", port=port)
