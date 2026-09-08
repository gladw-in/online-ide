# Sets up the rate limiter that stops people sending too many requests.
import ipaddress
import logging

import jwt
from flask import g, request
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from core.utils import SECRET_KEY


def rate_limit_key():
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

    x_forwarded_for = request.headers.get("X-Forwarded-For", "")
    ip_addresses = [
        ip_address.strip()
        for ip_address in x_forwarded_for.split(",")
        if ip_address.strip()
    ]

    for ip_address in reversed(ip_addresses):
        try:
            address = ipaddress.ip_address(ip_address)
            if not address.is_private:
                return f"ip:{ip_address}"

        except ValueError:
            continue

    return f"ip:{get_remote_address()}"


limiter = Limiter(
    key_func=rate_limit_key,
    default_limits=["200 per day", "50 per hour"],
    on_breach=lambda limit: logging.warning(f"Rate limit hit: {limit}"),
)
