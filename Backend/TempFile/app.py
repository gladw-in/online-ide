# Starts the flask app and connects all the API routes together.
import logging

from flask import Flask
from flask_cors import CORS
from werkzeug.middleware.proxy_fix import ProxyFix

import core.config as config
from core.extensions import limiter
from middleware import request_context
from routes import delete_file, get_file, index, upload

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)-8s %(module)s - %(message)s",
)

app = Flask(__name__)
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

app.config["MAX_CONTENT_LENGTH"] = config.MAX_CONTENT_LENGTH
app.config["RATELIMIT_STORAGE_URI"] = config.RATELIMIT_STORAGE_URI
app.config["RATELIMIT_KEY_PREFIX"] = config.RATELIMIT_KEY_PREFIX
app.config["RATELIMIT_STORAGE_OPTIONS"] = config.RATELIMIT_STORAGE_OPTIONS

CORS(
    app,
    origins=config.ALLOWED_ORIGINS,
    allow_headers=config.CORS_ALLOW_HEADERS,
)

limiter.init_app(app)
request_context.register(app)

app.register_blueprint(index.blueprint)
app.register_blueprint(upload.blueprint)
app.register_blueprint(get_file.blueprint)
app.register_blueprint(delete_file.blueprint)

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=config.PORT)
