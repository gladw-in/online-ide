# Saves, fetches, and deletes files in redis, and checks the upload data.
import json
from datetime import datetime, timedelta, timezone

from core.config import VALID_EXPIRY_TIMES


def validate_upload_payload(data):
    if (
        not data.get("code")
        or not data.get("language")
        or not data.get("title")
        or not data.get("expiryTime")
    ):
        return "Code, language, title, and expiry time are required"

    try:
        expiry_time_minutes = int(data["expiryTime"])
    except (TypeError, ValueError):
        return "expiryTime must be an integer (minutes)"

    if expiry_time_minutes not in VALID_EXPIRY_TIMES:
        return "Invalid expiry time. Please choose a valid value."

    if not isinstance(data.get("title"), str):
        return "title must be a string"

    if not isinstance(data.get("language"), str):
        return "language must be a string"

    return None


def store_file(redis_client, language, code, title, expiry_time_minutes, file_id):
    current_time = datetime.now(timezone.utc)
    expiry_time = current_time + timedelta(minutes=expiry_time_minutes)
    formatted_expiry_time = expiry_time.strftime("%Y-%m-%d %H:%M:%S UTC")

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

    return formatted_expiry_time


def fetch_file(redis_client, language, file_id):
    file_key = f"file:{language}-{file_id}:data"
    raw = redis_client.get(file_key)
    return json.loads(raw) if raw is not None else None


def delete_file_record(redis_client, language, file_id):
    file_key = f"file:{language}-{file_id}:data"
    return redis_client.delete(file_key) == 1
