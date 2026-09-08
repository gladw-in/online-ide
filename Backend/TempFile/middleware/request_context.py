# Adds a unique ID to each request and safety headers to every response.
import uuid

from flask import g, request


def register(app):
    @app.before_request
    def attach_request_id():
        g.request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))

    @app.after_request
    def add_request_id_header(response):
        response.headers["X-Request-ID"] = g.get("request_id", "-")
        return response

    @app.after_request
    def add_security_headers(response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "no-referrer"
        response.headers[
            "Permissions-Policy"
        ] = "geolocation=(), camera=(), microphone=()"

        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "frame-ancestors 'none'; "
            "object-src 'none'; "
            "base-uri 'self';"
        )

        response.headers["Strict-Transport-Security"] = "max-age=31536000"

        return response
