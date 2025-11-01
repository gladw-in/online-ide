import os
import re
import logging
from dotenv import load_dotenv
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
from google import genai
from google.genai import types
from prompts import *
from utils import *

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)

app = Flask(__name__)

CORS(app)

load_dotenv()

gemini_model = os.getenv("GEMINI_MODEL")
gemini_model_1 = os.getenv("GEMINI_MODEL_1")


def get_generated_code(problem_description, language):
    try:
        if language not in valid_languages:
            logging.warning(
                f"Unsupported language requested for generation: {language}"
            )
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
        logging.error(f"Error in get_generated_code function: {e}")
        return ""


def get_output(code, language):
    try:
        if language in languages_prompts:
            prompt = languages_prompts[language].format(
                code=code, time=utc_time_reference()
            )
        else:
            logging.warning(f"Unsupported language for get_output: {language}")
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
        logging.error(f"Error in get_output function: {e}")
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
        logging.error(f"Error in refactor_code function: {e}")
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
        logging.error(f"Error in refactor_code_html_css_js function: {e}")
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


@app.route("/")
def index():
    logging.info("Serving index page.")
    return render_template("index.html")


@app.route("/generate_code", methods=["POST"])
@token_required
def generate_code():
    logging.info("Received request for /generate_code")

    try:
        token = request.headers.get("X-Recaptcha-Token")

        if not is_human(token):
            logging.warning("reCAPTCHA verification failed for /generate_code.")
            abort(403, description="reCAPTCHA verification failed.")

        problem_description = request.json["problem_description"]
        language = request.json["language"]

        logging.info(f"Generating code for language: {language}")
        return get_generated_code(problem_description, language)

    except Exception as e:
        logging.error(f"Error in /generate_code endpoint: {e}")
        return jsonify({"error": str(e)}), 400


@app.route("/get-output", methods=["POST"])
def get_output_api():
    logging.info("Received request for /get-output")

    try:
        token = request.headers.get("X-Recaptcha-Token")

        if not is_human(token):
            logging.warning("reCAPTCHA verification failed for /get-output.")
            abort(403, description="reCAPTCHA verification failed.")

        code = request.json["code"]
        language = request.json["language"]

        if not code or not language:
            logging.warning("Missing code or language in /get-output request.")
            return jsonify({"error": "Missing code or language"}), 400

        if len(code.encode("utf-8")) > MAX_SIZE:
            logging.warning("Code size exceeds maximum allowed limit.")
            return jsonify({"error": "Code size exceeds the 0.5 MB limit"}), 413
        
        code = f"\n\n{code}\n\n"

        logging.info(f"Getting output for language: {language}")

        return get_output(code, language)

    except Exception as e:
        logging.error(f"Error in /get-output endpoint: {e}")
        return jsonify({"error": str(e)}), 400


@app.route("/refactor_code", methods=["POST"])
@token_required
def refactor_code_api():
    logging.info("Received request for /refactor_code")

    try:
        token = request.headers.get("X-Recaptcha-Token")

        if not is_human(token):
            logging.warning("reCAPTCHA verification failed for /refactor_code.")
            abort(403, description="reCAPTCHA verification failed.")

        code = request.json["code"]
        language = request.json["language"]
        problem_description = request.json["problem_description"]
        output = request.json["output"]

        if not code or not language:
            logging.warning("Missing code or language in /refactor_code request.")
            return jsonify({"error": "Missing code or language"}), 400

        if len(code.encode("utf-8")) > MAX_SIZE:
            logging.warning("Code size exceeds maximum allowed limit.")
            return jsonify({"error": "Code size exceeds the 0.5 MB limit"}), 413

        logging.info(f"Refactoring code for language: {language}")

        if problem_description:
            return refactor_code(code, language, output, problem_description)
        else:
            return refactor_code(code, language, output)

    except Exception as e:
        logging.error(f"Error in /refactor_code endpoint: {e}")
        return jsonify({"error": str(e)}), 400


@app.route("/improve-prompt", methods=["POST"])
@token_required
def improve_prompt():
    logging.info("Received request for /improve-prompt")
    token = request.headers.get("X-Recaptcha-Token")

    if not is_human(token):
        logging.warning("reCAPTCHA verification failed for /improve-prompt.")
        abort(403, description="reCAPTCHA verification failed.")

    data = request.get_json()

    topic = data.get("topic")

    if not topic:
        return jsonify({"error": "Missing topic"}), 400

    language = data.get("language")

    if not language or language not in {"htmlcssjs"} | valid_languages:
        return jsonify({"error": "Invalid or missing language"}), 400

    try:
        client = genai.Client()

        prompt_template = improve_prompts[language].format(topic=topic)

        response = client.models.generate_content(
            model=gemini_model,
            config=types.GenerateContentConfig(
                system_instruction=system_improve_prompt,
            ),
            contents=prompt_template,
        )

        gemini_output = response.text
        is_valid, parsed = validate_json(gemini_output)

        if not is_valid:
            logging.error("Invalid JSON response from Gemini for prompt improvement.")
            return jsonify({"error": "Invalid prompt format"}), 400

        logging.info(f"Successfully improved prompts for topic")

        return jsonify({"prompts": parsed})

    except Exception as e:
        logging.error(f"Error in /improve-prompt endpoint: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/htmlcssjsgenerate-code", methods=["POST"])
@token_required
def htmlcssjs_generate_stream():
    logging.info("Received request for /htmlcssjsgenerate-code")

    try:
        token = request.headers.get("X-Recaptcha-Token")
        if not is_human(token):
            logging.warning(
                "reCAPTCHA verification failed for /htmlcssjsgenerate-code."
            )
            abort(403, description="reCAPTCHA verification failed.")

        data = request.get_json()
        code_type = data.get("type")
        prompt = data.get("prompt")
        html_content = data.get("htmlContent", "")
        css_content = data.get("cssContent", "")

        if not prompt:
            return jsonify({"error": "Project description is required"}), 400

        if code_type not in {"html", "css", "js"}:
            return jsonify({"error": "Invalid or missing 'type' parameter"}), 400

        logging.info(f"Generating {code_type} code")

        generators = {
            "html": lambda: generate_html(prompt),
            "css": lambda: generate_css(html_content, prompt),
            "js": lambda: generate_js(html_content, css_content, prompt),
        }

        return generators[code_type]()

    except Exception as e:
        logging.error(f"Error in /htmlcssjsgenerate-code endpoint: {e}")
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500


@app.route("/htmlcssjsrefactor-code", methods=["POST"])
@token_required
def htmlcssjs_refactor():
    logging.info("Received request for /htmlcssjsrefactor-code")
    try:
        token = request.headers.get("X-Recaptcha-Token")

        if not is_human(token):
            logging.warning(
                "reCAPTCHA verification failed for /htmlcssjsrefactor-code."
            )
            abort(403, description="reCAPTCHA verification failed.")

        data = request.get_json()

        html_content = data.get("html") if len(data.get("html", "")) > 0 else ""
        css_content = data.get("css") if len(data.get("css", "")) > 0 else ""
        js_content = data.get("js") if len(data.get("js", "")) > 0 else ""

        if len(html_content.encode("utf-8")) > MAX_SIZE:
            logging.warning("HTML content exceeds 0.5 MB limit.")
            return jsonify({"error": "HTML content exceeds the 0.5 MB limit."}), 413

        if len(css_content.encode("utf-8")) > MAX_SIZE:
            logging.warning("CSS content exceeds 0.5 MB limit.")
            return jsonify({"error": "CSS content exceeds the 0.5 MB limit."}), 413

        if len(js_content.encode("utf-8")) > MAX_SIZE:
            logging.warning("JS content exceeds 0.5 MB limit.")
            return jsonify({"error": "JS content exceeds the 0.5 MB limit."}), 413

        code_type = data.get("type")
        problem_description_raw = data.get("problem_description")

        problem_description = (
            problem_description_raw.strip().lower() if problem_description_raw else None
        )

        if not code_type:
            return jsonify({"error": "Type is required."}), 400

        logging.info(f"Refactoring htmlcssjs code for type: {code_type}")

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
        logging.error(f"Error in /htmlcssjsrefactor-code endpoint: {e}")
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(debug=False)
