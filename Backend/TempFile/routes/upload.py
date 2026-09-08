# Handles requests to save a new temporary file and create its share link.
import logging
import uuid

import redis
from flask import Blueprint, abort, g, jsonify, request

from core.extensions import limiter
from services.file_storage import store_file, validate_upload_payload
from core.utils import (
    TEMP_FILE_URL,
    get_redis_connection,
    is_human,
    token_required,
    valid_languages,
)

blueprint = Blueprint("upload", __name__)


@blueprint.route("/temp-file-upload", methods=["POST"])
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
        content_type = request.content_type or ""
        if "application/json" not in content_type:
            return jsonify({"error": "Content-Type must be application/json"}), 415

        data = request.get_json(silent=True)
        if data is None:
            return jsonify({"error": "Request body must be valid JSON"}), 400

        validation_error = validate_upload_payload(data)
        if validation_error:
            logging.warning(
                f"[{g.request_id}] Upload validation failed: {validation_error}"
            )

            return jsonify({"error": validation_error}), 400

        expiry_time_minutes = int(data["expiryTime"])
        code = data["code"]
        language = data["language"].strip().lower()
        title = data["title"][:200].strip()

        if not title:
            return jsonify({"error": "title cannot be blank or whitespace-only"}), 400

        if language not in valid_languages:
            logging.warning(f"[{g.request_id}] Unsupported language: {language}")
            return jsonify({"error": "Unsupported language."}), 400

        if len(code) > 512000:
            logging.warning(f"[{g.request_id}] Payload too large rejected.")
            return jsonify({"error": "Code exceeds maximum allowed size (500KB)."}), 413

        file_id = str(uuid.uuid4())
        formatted_expiry_time = store_file(
            redis_client, language, code, title, expiry_time_minutes, file_id
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

    except redis.RedisError as error:
        logging.error(f"[{g.request_id}] Redis error during file upload: {error}")
        return jsonify({"error": "Failed to store code in Redis"}), 500
    except Exception as error:
        logging.error(f"[{g.request_id}] Unexpected error during file upload: {error}")
        return jsonify({"error": "An unexpected error occurred"}), 500
