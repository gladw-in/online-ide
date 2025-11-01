from flask import (
    Flask,
    abort,
    request,
    jsonify,
    render_template,
    redirect,
    url_for,
)
from flask_cors import CORS
import os
import uuid
import json
import redis
from utils import *
from datetime import datetime, timedelta
from dotenv import load_dotenv
import logging

load_dotenv()

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)

app = Flask(__name__)
CORS(app)

TEMP_FILE_URL = os.getenv("TEMP_FILE_URL")


@app.route("/", methods=["GET"])
def index():
    logging.info("Serving index page.")
    return render_template("index.html")


@app.route("/temp-file-upload", methods=["POST"])
@token_required
def upload_file():
    logging.info("Received request to /temp-file-upload")
    token = request.headers.get("X-Recaptcha-Token")

    if not is_human(token):
        logging.warning("reCAPTCHA verification failed for upload request.")
        abort(403, description="reCAPTCHA verification failed.")

    redis_client = get_redis_connection()
    if not redis_client:
        logging.error("Could not connect to Redis.")
        return jsonify({"error": "Failed to connect to Redis"}), 503

    try:
        data = request.get_json()

        if (
            not data
            or not data.get("code")
            or not data.get("language")
            or not data.get("title")
            or not data.get("expiryTime")
        ):
            logging.warning("Upload request missing required fields.")
            return (
                jsonify(
                    {"error": "Code, language, title, and expiry time are required"}
                ),
                400,
            )

        valid_expiry_times = (10, 30, 60, 1440, 10080)
        expiry_time_minutes = int(data["expiryTime"])

        if expiry_time_minutes not in valid_expiry_times:
            logging.warning(f"Invalid expiry time received: {expiry_time_minutes}")
            return (
                jsonify({"error": "Invalid expiry time. Please choose a valid value."}),
                400,
            )

        code = data["code"]
        language = data["language"]
        title = data["title"]

        current_time = datetime.utcnow()
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

        logging.info(f"Successfully created file {language}-{file_id}")

        return jsonify(
            {
                "message": "Code uploaded successfully",
                "fileUrl": file_url,
                "expiry_time": formatted_expiry_time,
            }
        )

    except redis.RedisError as e:
        logging.error(f"Redis error during file upload: {e}")
        return jsonify({"error": "Failed to store code in Redis"}), 500

    except Exception as e:
        logging.error(f"Unexpected error during file upload: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500

    finally:
        redis_client.close()


@app.route("/file/<shareId>", methods=["GET"])
def get_file(shareId):
    logging.info(f"Received request to get file: {shareId}")
    redis_client = get_redis_connection()
    if not redis_client:
        logging.error("Could not connect to Redis.")
        return jsonify({"error": "Failed to connect to Redis"}), 503

    try:
        header_shareId = request.headers.get("X-File-ID")

        if not header_shareId or header_shareId != shareId:
            logging.warning(
                f"Redirecting unauthorized access attempt for file: {shareId}"
            )
            return redirect(url_for("index"))

        try:
            language, file_id = shareId.split("-", 1)
        except ValueError:
            logging.warning(f"Invalid shareId format received: {shareId}")
            return (
                jsonify(
                    {
                        "error": "Invalid 'shareId' format. It should be 'language-file_id'."
                    }
                ),
                400,
            )

        file_key = f"file:{language}-{file_id}:data"
        file_data = redis_client.get(file_key)
        ttl = redis_client.ttl(file_key)

        if ttl == -2:
            logging.info(f"File not found for key: {file_key}")
            return jsonify({"error": "File not found"}), 404
        elif ttl == -1 or ttl == 0:
            logging.info(f"File has expired for key: {file_key}")
            return jsonify({"error": "File has expired"}), 410

        if file_data:
            logging.info(f"Successfully retrieved file: {file_key}")
            file_data = json.loads(file_data)
            return jsonify(file_data), 200

        logging.warning(f"File data was None for key: {file_key}")
        return jsonify({"error": "File not found"}), 404

    except redis.RedisError as e:
        logging.error(f"Redis error during file retrieval: {e}")
        return jsonify({"error": "Failed to retrieve code from Redis"}), 500

    except Exception as e:
        logging.error(f"Unexpected error during file retrieval: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500

    finally:
        redis_client.close()


@app.route("/file/<file_id>/delete", methods=["DELETE"])
@token_required
def delete_file(file_id):
    logging.info(f"Received request to delete file: {file_id}")
    token = request.headers.get("X-Recaptcha-Token")

    if not is_human(token):
        logging.warning("reCAPTCHA verification failed for delete request.")
        abort(403, description="reCAPTCHA verification failed.")

    redis_client = get_redis_connection()
    if not redis_client:
        logging.error("Could not connect to Redis.")
        return jsonify({"error": "Failed to connect to Redis"}), 503

    try:
        language, file_id_part = file_id.split("-", 1)
        file_key = f"file:{language}-{file_id_part}:data"

        if redis_client.exists(file_key):
            redis_client.delete(file_key)
            logging.info(f"Successfully deleted file: {file_key}")
            return jsonify({"message": "File deleted successfully"}), 200
        else:
            logging.warning(f"Attempted to delete a non-existent file: {file_key}")
            return jsonify({"error": "File not found"}), 404

    except redis.RedisError as e:
        logging.error(f"Redis error during file deletion: {e}")
        return jsonify({"error": "Failed to delete file from Redis"}), 500

    except Exception as e:
        logging.error(f"Unexpected error during file deletion: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500

    finally:
        redis_client.close()


if __name__ == "__main__":
    app.run(debug=False)
