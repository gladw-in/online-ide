import os
import re
import jwt
from google import genai
from google.genai import types
from dotenv import load_dotenv
import requests
from flask import (
    Flask,
    Response,
    abort,
    jsonify,
    render_template,
    request,
    stream_with_context,
)
from flask_cors import CORS
from functools import wraps
from datetime import datetime, timezone
from prompts import *

valid_languages = {
    "python",
    "javascript",
    "rust",
    "mongodb",
    "swift",
    "ruby",
    "dart",
    "perl",
    "scala",
    "julia",
    "go",
    "java",
    "cpp",
    "csharp",
    "c",
    "sql",
    "typescript",
    "kotlin",
    "verilog",
}

app = Flask(__name__)

CORS(app)

load_dotenv()

CODE_REGEX = r"```(?:\w+\n)?(.*?)```"

gemini_model = os.getenv("GEMINI_MODEL")
gemini_model_1 = os.getenv("GEMINI_MODEL_1")
SECRET_KEY = os.getenv("JWT_SECRET")
RECAPTCHA_SECRET_KEY = os.getenv("RECAPTCHA_SECRET_KEY")


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


def get_generated_code(problem_description, language):
    try:
        if language not in valid_languages:
            return "Error: Unsupported language."

        def stream():
            client = genai.Client()

            response = client.models.generate_content_stream(
                model=gemini_model,
                contents=generate_code_prompt.format(
                    problem_description=problem_description, language=language
                ),
                config=types.GenerateContentConfig(
                    system_instruction=generate_instruction.format(language=language),
                ),
            )

            for chunk in response:
                if chunk.text:
                    yield chunk.text

        return Response(stream_with_context(stream()), mimetype="text/plain")

    except Exception as e:
        return ""


def get_output(code, language):
    try:
        if language in languages_prompts:
            prompt = languages_prompts[language].format(
                code=code, time=utc_time_reference()
            )
        else:
            return "Error: Language not supported."

        def stream():
            client = genai.Client()

            response = client.models.generate_content_stream(
                model=gemini_model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=compiler_instruction.format(language=language),
                ),
            )

            for chunk in response:
                if chunk.text:
                    yield chunk.text

        return Response(stream_with_context(stream()), mimetype="text/plain")
    except Exception as e:
        return f"Error: Unable to process the code. {str(e)}"


def refactor_code(code, language, output, problem_description=None):
    try:
        if language not in valid_languages:
            return "Error: Unsupported language."

        if problem_description:
            refactor_contnet = refactor_code_prompt_user.format(
                code=code,
                language=language,
                problem_description=problem_description or "",
                output=output,
            )
        else:
            refactor_contnet = refactor_code_prompt.format(
                code=code, language=language, output=output
            )

        def stream():
            client = genai.Client()

            response = client.models.generate_content_stream(
                model=gemini_model,
                contents=refactor_contnet,
                config=types.GenerateContentConfig(
                    system_instruction=refactor_instruction.format(language=language),
                ),
            )

            for chunk in response:
                if chunk.text:
                    yield chunk.text

        return Response(stream_with_context(stream()), mimetype="text/plain")

    except Exception as e:
        print(f"Error analyzing code: {e}")
        return ""


def refactor_code_html_css_js(language, prompt, params, problem_description=None):
    try:

        if problem_description:
            formatted_prompt = prompt.format(
                **params, problem_description=problem_description
            )
        else:
            formatted_prompt = prompt.format(**params)

        client = genai.Client()

        response = client.models.generate_content(
            model=gemini_model_1,
            contents=formatted_prompt,
            config=types.GenerateContentConfig(
                system_instruction=refactor_instruction.format(language=language),
            ),
        )

        result = response.text.strip()
        return result
    except Exception as e:
        return f"Error: {e}"


def generate_html(prompt):
    formatted_prompt = html_prompt.format(prompt=prompt, time=utc_time_reference())

    def stream():
        client = genai.Client()

        response = client.models.generate_content_stream(
            model=gemini_model_1,
            contents=formatted_prompt,
            config=types.GenerateContentConfig(
                system_instruction=html_generate_instruction,
            ),
        )
        for chunk in response:
            if chunk.text:
                yield chunk.text

    return Response(stream_with_context(stream()), mimetype="text/plain")


def generate_css(html_content, project_description):
    formatted_prompt = css_prompt.format(
        html_content=html_content,
        project_description=project_description,
        time=utc_time_reference(),
    )

    def stream():
        client = genai.Client()

        response = client.models.generate_content_stream(
            model=gemini_model_1,
            contents=formatted_prompt,
            config=types.GenerateContentConfig(
                system_instruction=css_generate_instruction,
            ),
        )
        for chunk in response:
            if chunk.text:
                yield chunk.text

    return Response(stream_with_context(stream()), mimetype="text/plain")


def generate_js(html_content, css_content, project_description):
    formatted_prompt = js_prompt.format(
        html_content=html_content,
        css_content=css_content,
        project_description=project_description,
        time=utc_time_reference(),
    )

    def stream():
        client = genai.Client()

        response = client.models.generate_content_stream(
            model=gemini_model_1,
            contents=formatted_prompt,
            config=types.GenerateContentConfig(
                system_instruction=js_generate_instruction,
            ),
        )
        for chunk in response:
            if chunk.text:
                yield chunk.text

    return Response(stream_with_context(stream()), mimetype="text/plain")


def utc_time_reference():
    utc_now = datetime.now(timezone.utc)
    formatted_time = utc_now.strftime("%I:%M:%S %p on %B %d, %Y")
    return f"{formatted_time} UTC time zone"


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/generate_code", methods=["POST"])
@token_required
def generate_code():
    try:
        token = request.headers.get("X-Recaptcha-Token")

        if not is_human(token):
            abort(403, description="reCAPTCHA verification failed.")

        problem_description = request.json["problem_description"]
        language = request.json["language"]

        return get_generated_code(problem_description, language)

    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/get-output", methods=["POST"])
def get_output_api():
    try:
        token = request.headers.get("X-Recaptcha-Token")

        if not is_human(token):
            abort(403, description="reCAPTCHA verification failed.")

        code = request.json["code"]
        language = request.json["language"]

        if not code or not language:
            return jsonify({"error": "Missing code or language"}), 400

        return get_output(code, language)

    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/refactor_code", methods=["POST"])
@token_required
def refactor_code_api():
    try:
        token = request.headers.get("X-Recaptcha-Token")

        if not is_human(token):
            abort(403, description="reCAPTCHA verification failed.")

        code = request.json["code"]
        language = request.json["language"]
        problem_description = request.json["problem_description"]
        output = request.json["output"]

        if not code or not language:
            return jsonify({"error": "Missing code or language"}), 400

        if problem_description:
            return refactor_code(code, language, output, problem_description)
        else:
            return refactor_code(code, language, output)

    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/htmlcssjsgenerate-code", methods=["POST"])
@token_required
def htmlcssjs_generate_stream():
    token = request.headers.get("X-Recaptcha-Token")

    if not is_human(token):
        abort(403, description="reCAPTCHA verification failed.")

    data = request.get_json()
    project_description = data.get("prompt")
    code_type = data.get("type")
    html_content = data.get("htmlContent", "")
    css_content = data.get("cssContent", "")

    if not project_description:
        return jsonify({"error": "Project description is required"}), 400

    if code_type not in ["html", "css", "js"]:
        return jsonify({"error": "Invalid or missing 'type' parameter"}), 400

    try:
        if code_type == "html":
            return generate_html(project_description)
        elif code_type == "css":
            return generate_css(html_content, project_description)
        elif code_type == "js":
            return generate_js(html_content, css_content, project_description)
        else:
            return jsonify({"error": "Unsupported code type."}), 400

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500


@app.route("/htmlcssjsrefactor-code", methods=["POST"])
@token_required
def htmlcssjs_refactor():
    try:
        token = request.headers.get("X-Recaptcha-Token")

        if not is_human(token):
            abort(403, description="reCAPTCHA verification failed.")

        data = request.get_json()
        html_content = data.get("html") if len(data.get("html", "")) > 0 else ""
        css_content = data.get("css") if len(data.get("css", "")) > 0 else ""
        js_content = data.get("js") if len(data.get("js", "")) > 0 else ""
        code_type = data.get("type")
        problem_description_raw = data.get("problem_description")

        problem_description = (
            problem_description_raw.strip().lower() if problem_description_raw else None
        )

        if not code_type:
            return jsonify({"error": "Type is required."}), 400

        if code_type == "html" and html_content and problem_description:
            html_content_refactored = refactor_code_html_css_js(
                "html",
                refactor_html_prompt_user,
                {"html_content": html_content},
                problem_description,
            )
            html_content_refactored = re.search(
                CODE_REGEX, html_content_refactored, re.DOTALL
            )
            html_content_refactored = (
                html_content_refactored.group(1)
                if html_content_refactored
                else html_content
            )
            return jsonify({"html": html_content_refactored})

        elif code_type == "css" and html_content and problem_description:
            if not html_content:
                return (
                    jsonify({"error": "HTML content is required for CSS refactoring."}),
                    400,
                )
            css_content_refactored = refactor_code_html_css_js(
                "css",
                refactor_css_prompt_user,
                {"html_content": html_content, "css_content": css_content},
                problem_description,
            )
            css_content_refactored = re.search(
                CODE_REGEX, css_content_refactored, re.DOTALL
            )
            css_content_refactored = (
                css_content_refactored.group(1)
                if css_content_refactored
                else css_content
            )
            return jsonify({"css": css_content_refactored})

        elif code_type == "js" and html_content and css_content and problem_description:
            if not html_content or not css_content:
                return (
                    jsonify(
                        {
                            "error": "Both HTML and CSS content are required for JS refactoring."
                        }
                    ),
                    400,
                )
            js_content_refactored = refactor_code_html_css_js(
                "js",
                refactor_js_prompt_user,
                {
                    "html_content": html_content,
                    "css_content": css_content,
                    "js_content": js_content,
                },
                problem_description,
            )
            js_content_refactored = re.search(
                CODE_REGEX, js_content_refactored, re.DOTALL
            )
            js_content_refactored = (
                js_content_refactored.group(1) if js_content_refactored else js_content
            )

            return jsonify({"js": js_content_refactored})

        elif code_type == "html" and html_content:
            html_content_refactored = refactor_code_html_css_js(
                "html", refactor_html_prompt, {"html_content": html_content}
            )
            html_content_refactored = re.search(
                CODE_REGEX, html_content_refactored, re.DOTALL
            )
            html_content_refactored = (
                html_content_refactored.group(1)
                if html_content_refactored
                else html_content
            )
            return jsonify({"html": html_content_refactored})

        elif code_type == "css" and html_content:
            if not html_content:
                return (
                    jsonify({"error": "HTML content is required for CSS refactoring."}),
                    400,
                )
            css_content_refactored = refactor_code_html_css_js(
                "css",
                refactor_css_prompt,
                {"html_content": html_content, "css_content": css_content},
            )
            css_content_refactored = re.search(
                CODE_REGEX, css_content_refactored, re.DOTALL
            )
            css_content_refactored = (
                css_content_refactored.group(1)
                if css_content_refactored
                else css_content
            )
            return jsonify({"css": css_content_refactored})

        elif code_type == "js" and html_content and css_content:
            if not html_content or not css_content:
                return (
                    jsonify(
                        {
                            "error": "Both HTML and CSS content are required for JS refactoring."
                        }
                    ),
                    400,
                )
            js_content_refactored = refactor_code_html_css_js(
                "js",
                refactor_js_prompt,
                {
                    "html_content": html_content,
                    "css_content": css_content,
                    "js_content": js_content,
                },
            )
            js_content_refactored = re.search(
                CODE_REGEX, js_content_refactored, re.DOTALL
            )
            js_content_refactored = (
                js_content_refactored.group(1) if js_content_refactored else js_content
            )
            return jsonify({"js": js_content_refactored})

        else:
            return (
                jsonify(
                    {
                        "error": "Please provide the appropriate content for the requested type."
                    }
                ),
                400,
            )

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(debug=False)
