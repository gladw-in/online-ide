# Handles requests to delete a saved temporary file.
import logging

import redis
from flask import Blueprint, abort, g, jsonify, request

from core.extensions import limiter
from services.file_storage import delete_file_record
from core.utils import FILE_ID_RE, get_redis_connection, is_human, token_required

blueprint = Blueprint("delete_file", __name__)


@blueprint.route("/file/<file_id>/delete", methods=["DELETE"])
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

    redis_client = get_redis_connection()
    if not redis_client:
        logging.error(f"[{g.request_id}] Could not connect to Redis.")
        return jsonify({"error": "Service temporarily unavailable"}), 503

    try:
        if delete_file_record(redis_client, language, uuid_part):
            logging.info(
                f"[{g.request_id}] Successfully deleted file: file:{safe_id}:data"
            )

            return jsonify({"message": "File deleted successfully"}), 200

        logging.warning(
            f"[{g.request_id}] Delete target not found: file:{safe_id}:data"
        )

        return jsonify({"error": "File not found or already expired"}), 404

    except redis.RedisError as error:
        logging.error(f"[{g.request_id}] Redis error during file deletion: {error}")
        return jsonify({"error": "Failed to delete file from Redis"}), 500
    except Exception as error:
        logging.error(
            f"[{g.request_id}] Unexpected error during file deletion: {error}"
        )
        return jsonify({"error": "An unexpected error occurred"}), 500
