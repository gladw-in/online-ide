import os
import jwt
import redis
import requests
from functools import wraps
from flask import request, jsonify
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET")
RECAPTCHA_SECRET_KEY = os.getenv("RECAPTCHA_SECRET_KEY")


def get_redis_connection():
    try:
        redis_client = redis.StrictRedis(
            host=os.getenv("REDIS_HOST"),
            port=int(os.getenv("REDIS_PORT")),
            password=os.getenv("REDIS_PASSWORD"),
            ssl=True,
        )
        redis_client.ping()
        return redis_client
    except redis.ConnectionError as e:
        app.logger.error(f"Redis connection error: {e}")
        return None


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
            request.user_data = decoded
        except jwt.InvalidTokenError as e:
            return jsonify({"message": "Invalid token!"}), 401

        return f(*args, **kwargs)

    return decorator
