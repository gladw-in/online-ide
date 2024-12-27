import os
import re
import google.generativeai as genai
from dotenv import load_dotenv
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import absl.logging
from prompts import (
    languages_prompts,
    html_prompt,
    css_prompt,
    js_prompt,
    generate_code_prompt,
    refactor_code_prompt,
)

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

if not api_key:
    print("API key is missing in environment variables.")

try:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-1.5-flash")
except Exception as e:
    print(f"Error configuring the model: {e}")


def get_generated_code(problem_description, language):
    try:
        response = model.generate_content(
            generate_code_prompt.format(
                problem_description=problem_description, language=language
            )
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

        response = model.generate_content(prompt)
        return response.text

    except Exception as e:
        return f"Error: Unable to process the code. {str(e)}"


def refactor_code(code, language):
    try:
        response = model.generate_content(
            refactor_code_prompt.format(code=code, language=language)
        )
        return response.text.strip()
    except Exception as e:
        print(f"Error analyzing code: {e}")
        return ""


def generate_code_html_css_js(prompt, params):
    try:
        formatted_prompt = prompt.format(**params)

        response = model.generate_content(formatted_prompt)

        result = response.text.strip()
        return result

    except Exception as e:
        return f"Error: {e}"


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
    try:
        data = request.get_json()
        prompt = data.get("prompt")
        code_type = data.get("type")

        if not prompt or not code_type:
            return jsonify({"error": "Prompt and type are required."}), 400

        if code_type == "html":
            content = generate_code_html_css_js(html_prompt, {"prompt": prompt})
            content = re.search(CODE_REGEX, content, re.DOTALL)
            content = content.group(1) if content else content
            return jsonify({"html": content})

        elif code_type == "css":
            html_content = generate_code_html_css_js(html_prompt, {"prompt": prompt})
            content = generate_code_html_css_js(
                css_prompt, {"html_content": html_content}
            )
            content = re.search(CODE_REGEX, content, re.DOTALL)
            content = content.group(1) if content else content
            return jsonify({"css": content})

        elif code_type == "js":
            html_content = generate_code_html_css_js(html_prompt, {"prompt": prompt})
            css_content = generate_code_html_css_js(
                css_prompt, {"html_content": html_content}
            )
            content = generate_code_html_css_js(
                js_prompt, {"html_content": html_content, "css_content": css_content}
            )
            content = re.search(CODE_REGEX, content, re.DOTALL)
            content = content.group(1) if content else content
            return jsonify({"js": content})

        else:
            return (
                jsonify(
                    {
                        "error": "Invalid type. Please choose from 'html', 'css', or 'js'."
                    }
                ),
                400,
            )

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500


@app.route("/htmlcssjsrefactor-code", methods=["POST"])
def htmlcssjs_refactor():
    try:
        data = request.get_json()
        html_content = data.get("html")
        css_content = data.get("css")
        js_content = data.get("js")
        code_type = data.get("type")

        if not code_type:
            return jsonify({"error": "Type is required."}), 400

        if code_type == "html" and html_content:
            html_content_refactored = generate_code_html_css_js(
                html_prompt, {"prompt": html_content}
            )
            html_content_refactored = re.search(
                CODE_REGEX, html_content_refactored, re.DOTALL
            )
            html_content_refactored = (
                html_content_refactored.group(1)
                if html_content_refactored
                else html_content_refactored
            )
            return jsonify({"html": html_content_refactored})

        elif code_type == "css" and html_content:
            html_content_refactored = generate_code_html_css_js(
                html_prompt, {"prompt": html_content}
            )
            css_content_refactored = generate_code_html_css_js(
                css_prompt, {"html_content": html_content_refactored}
            )
            css_content_refactored = re.search(
                CODE_REGEX, css_content_refactored, re.DOTALL
            )
            css_content_refactored = (
                css_content_refactored.group(1)
                if css_content_refactored
                else css_content_refactored
            )
            return jsonify({"css": css_content_refactored})

        elif code_type == "js" and html_content and css_content:
            html_content_refactored = generate_code_html_css_js(
                html_prompt, {"prompt": html_content}
            )
            css_content_refactored = generate_code_html_css_js(
                css_prompt, {"html_content": html_content_refactored}
            )
            js_content_refactored = generate_code_html_css_js(
                js_prompt,
                {
                    "html_content": html_content_refactored,
                    "css_content": css_content_refactored,
                },
            )
            js_content_refactored = re.search(
                CODE_REGEX, js_content_refactored, re.DOTALL
            )
            js_content_refactored = (
                js_content_refactored.group(1)
                if js_content_refactored
                else js_content_refactored
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
