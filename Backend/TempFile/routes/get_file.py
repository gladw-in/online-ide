# Handles requests to fetch a saved temporary file by its link.
import logging

import redis
from flask import Blueprint, g, jsonify, redirect, request, url_for

from core.extensions import limiter
from services.file_storage import fetch_file
from core.utils import FILE_ID_RE, get_redis_connection

blueprint = Blueprint("get_file", __name__)


@blueprint.route("/file/<shareId>", methods=["GET"])
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

            return redirect(url_for("index.index"))

        language, file_id = shareId.split("-", 1)
        file_data = fetch_file(redis_client, language, file_id)

        if file_data is None:
            logging.info(
                f"[{g.request_id}] Key not found or expired: file:{shareId}:data"
            )

            return jsonify({"error": "File not found or has expired"}), 404

        logging.info(
            f"[{g.request_id}] Successfully retrieved file: file:{shareId}:data"
        )

        return jsonify(file_data), 200

    except redis.RedisError as error:
        logging.error(f"[{g.request_id}] Redis error during file retrieval: {error}")
        return jsonify({"error": "Failed to retrieve code from Redis"}), 500
    except Exception as error:
        logging.error(
            f"[{g.request_id}] Unexpected error during file retrieval: {error}"
        )
        return jsonify({"error": "An unexpected error occurred"}), 500
