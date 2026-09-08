# Shows the simple homepage for this service.
import logging

from flask import Blueprint, g, render_template

blueprint = Blueprint("index", __name__)


@blueprint.route("/", methods=["GET"])
def index():
    logging.info(f"[{g.request_id}] Serving index page.")
    return render_template("index.html")
