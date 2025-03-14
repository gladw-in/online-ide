import os
import re
from google import genai
from dotenv import load_dotenv
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import absl.logging
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

os.environ["GRPC_VERBOSITY"] = "NONE"

absl.logging.set_verbosity(absl.logging.ERROR)

try:
    load_dotenv()
except Exception as e:
    print(f"Error loading environment variables: {e}")

CODE_REGEX = r"```(?:\w+\n)?(.*?)```"

api_key = os.getenv("GEMINI_API_KEY")
gemini_model = os.getenv("GEMINI_MODEL")
gemini_model_1 = os.getenv("GEMINI_MODEL_1")


def get_generated_code(problem_description, language):
    try:
        if language not in valid_languages:
            return "Error: Unsupported language."

        client = genai.Client(api_key=api_key)

        response = client.models.generate_content(
            model=gemini_model,
            contents=generate_code_prompt.format(
                problem_description=problem_description, language=language
            ),
        )
        return response.text.strip()
    except Exception as e:
        return ""


def get_output(code, language):
    try:
        if language in languages_prompts:
            prompt = languages_prompts[language].format(code=code)
        else:
            return "Error: Language not supported."

        client = genai.Client(api_key=api_key)

        response = client.models.generate_content(
            model=gemini_model,
            contents=prompt,
        )

        return response.text
    except Exception as e:
        return f"Error: Unable to process the code. {str(e)}"


def refactor_code(code, language):
    try:
        if language not in valid_languages:
            return "Error: Unsupported language."

        client = genai.Client(api_key=api_key)

        response = client.models.generate_content(
            model=gemini_model,
            contents=refactor_code_prompt.format(code=code, language=language),
        )

        return response.text.strip()
    except Exception as e:
        print(f"Error analyzing code: {e}")
        return ""


def generate_code_html_css_js(prompt, params):
    try:
        formatted_prompt = prompt.format(**params)

        client = genai.Client(api_key=api_key)

        response = client.models.generate_content(
            model=gemini_model_1,
            contents=formatted_prompt,
        )

        result = response.text.strip()
        return result
    except Exception as e:
        return f"Error: {e}"


def generate_html(prompt):
    formatted_prompt = html_prompt.format(prompt=prompt)

    client = genai.Client(api_key=api_key)

    response = client.models.generate_content(
        model=gemini_model_1,
        contents=formatted_prompt,
    )
    return extract_code(response.text)


def generate_css(html_content, project_description):
    formatted_prompt = css_prompt.format(
        html_content=html_content, project_description=project_description
    )

    client = genai.Client(api_key=api_key)

    response = client.models.generate_content(
        model=gemini_model_1,
        contents=formatted_prompt,
    )

    return extract_code(response.text)


def generate_js(html_content, css_content, project_description):
    formatted_prompt = js_prompt.format(
        html_content=html_content,
        css_content=css_content,
        project_description=project_description,
    )

    client = genai.Client(api_key=api_key)

    response = client.models.generate_content(
        model=gemini_model_1,
        contents=formatted_prompt,
    )

    return extract_code(response.text)


def extract_code(output):
    match = re.search(CODE_REGEX, output, re.DOTALL)
    if match:
        return match.group(1)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/generate_code", methods=["POST"])
def generate_code():
    try:
        problem_description = request.json["problem_description"]
        language = request.json["language"]
        generated_code = get_generated_code(problem_description, language)
        return jsonify({"code": extract_code(generated_code)})
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/get-output", methods=["POST"])
def get_output_api():
    try:
        code = request.json["code"]
        language = request.json["language"]
        output = get_output(code, language)
        return jsonify({"output": output})
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/refactor_code", methods=["POST"])
def refactor_code_api():
    try:
        code = request.json["code"]
        language = request.json["language"]
        refactored_code = refactor_code(code, language)
        return jsonify({"code": extract_code(refactored_code)})
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/htmlcssjsgenerate-code", methods=["POST"])
def htmlcssjs_generate():
    data = request.get_json()
    project_description = data.get("prompt")
    code_type = data.get("type")
    html_content = (
        data.get("htmlContent", "") if len(data.get("htmlContent", "")) > 0 else ""
    )
    css_content = (
        data.get("cssContent", "") if len(data.get("cssContent", "")) > 0 else ""
    )

    if not project_description:
        return jsonify({"error": "Project description is required"}), 400
    if not code_type or code_type not in ["html", "css", "js"]:
        return jsonify({"error": "Invalid or missing 'type' parameter"}), 400

    try:
        html_code = (
            generate_html(project_description) if code_type == "html" else html_content
        )
        css_code = (
            generate_css(html_code, project_description)
            if code_type == "css"
            else css_content
        )
        js_code = (
            generate_js(html_code, css_code, project_description)
            if code_type == "js"
            else ""
        )

        if code_type == "html":
            return jsonify({"html": html_code})
        elif code_type == "css":
            return jsonify({"css": css_code})
        elif code_type == "js":
            return jsonify({"js": js_code})
        else:
            return jsonify({"error": "Invalid code type requested."}), 400

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500


@app.route("/htmlcssjsrefactor-code", methods=["POST"])
def htmlcssjs_refactor():
    try:
        data = request.get_json()
        html_content = data.get("html") if len(data.get("html", "")) > 0 else ""
        css_content = data.get("css") if len(data.get("css", "")) > 0 else ""
        js_content = data.get("js") if len(data.get("js", "")) > 0 else ""
        code_type = data.get("type")

        if not code_type:
            return jsonify({"error": "Type is required."}), 400

        def refactor_content(prompt, content):
            return generate_code_html_css_js(prompt, content)

        if code_type == "html" and html_content:
            html_content_refactored = refactor_content(
                refactor_html_prompt, {"html_content": html_content}
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
            css_content_refactored = refactor_content(
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
            js_content_refactored = refactor_content(
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
    app.run(debug=True)
