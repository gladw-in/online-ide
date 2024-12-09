from flask import Flask, request, jsonify
from openai import OpenAI
from dotenv import load_dotenv
import os
import re
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
CORS(app)

CODE_REGEX = r"```(?:\w+\n)?(.*?)```"

NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")

client = OpenAI(api_key=NVIDIA_API_KEY, base_url="https://integrate.api.nvidia.com/v1")

html_prompt = """
I need the HTML for the following project. Please provide only the HTML code, i.e., the code inside the <body> tag and no JS or CSS file links and if I have any CDN file, I don't want any inline JS and CSS inside <script> and <style> or any library. I want it all inside the body only, no extra text, make the code as small as possible.
Project description: {prompt}
"""

css_prompt = """
Given the following HTML code for a project, I need the CSS to style it. Please provide only the CSS code, no other extra text,  make the code as small as possible.
HTML: {html_content}
"""

js_prompt = """
Given the following HTML and CSS code for a project, I need the JavaScript to make it functional. Please provide only the JavaScript code, no extra text and  make the code as small as possible.
HTML: {html_content}
CSS: {css_content}
"""


def generate_code_html_css_js(prompt, params):
    try:
        completion = client.chat.completions.create(
            model="nvidia/llama-3.1-nemotron-70b-instruct",
            messages=[{"role": "user", "content": prompt.format(**params)}],
            temperature=0.5,
            top_p=1,
            max_tokens=1024,
            stream=True,
        )

        result = ""
        for chunk in completion:
            if chunk.choices[0].delta.content:
                result += chunk.choices[0].delta.content

        return result.strip()

    except Exception as e:
        return f"Error: {e}"


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


@app.route("/generate-code", methods=["POST"])
def generate_code():
    try:
        data = request.get_json()
        language = data.get("language")
        prompt = data.get("prompt")

        if not language or not prompt:
            return jsonify({"error": "Both language and prompt are required."}), 400

        formatted_prompt = f"Please provide only the **code** in {language} for the following problem: {prompt}. Do not include explanations, markdown headers, comments, or anything other than the code itself."

        completion = client.chat.completions.create(
            model="nvidia/llama-3.1-nemotron-70b-instruct",
            messages=[{"role": "user", "content": formatted_prompt}],
            temperature=0.5,
            top_p=1,
            max_tokens=1024,
            stream=True,
        )

        generated_code = ""
        for chunk in completion:
            if chunk.choices[0].delta.content is not None:
                generated_code += chunk.choices[0].delta.content

        raw_code = re.search(CODE_REGEX, generated_code, re.DOTALL)
        if raw_code:
            return jsonify({"code": raw_code.group(1).strip()})
        else:
            return jsonify({"error": "Failed to extract code."}), 500

    except Exception as e:
        return jsonify({"error": f"Failed to generate code. Error: {str(e)}"}), 500


@app.route("/refactor", methods=["POST"])
def refactor():
    try:
        data = request.get_json()
        language = data.get("language")
        code = data.get("code")

        if not code:
            return jsonify({"error": "No code provided."}), 400

        refactor_prompt = f"Please fix the following code and provide **only the corrected code** without explanations, markdown headers, extra comments, or anything else:\n{code} in {language}\nand give the errors in comments only."

        completion = client.chat.completions.create(
            model="nvidia/llama-3.1-nemotron-70b-instruct",
            messages=[{"role": "user", "content": refactor_prompt}],
            temperature=0.5,
            top_p=1,
            max_tokens=1024,
            stream=True,
        )

        fixed_code = ""
        for chunk in completion:
            if chunk.choices[0].delta.content is not None:
                fixed_code += chunk.choices[0].delta.content

        raw_code = re.search(CODE_REGEX, fixed_code, re.DOTALL)
        if raw_code:
            return jsonify({"code": raw_code.group(1).strip()})
        else:
            return jsonify({"error": "Failed to refactor code."}), 500

    except Exception as e:
        return jsonify({"error": f"Failed to refactor code. Error: {str(e)}"}), 500

@app.route("/get-output", methods=["POST"])
def get_output():
    try:
        data = request.get_json()
        language = data.get("language")
        code = data.get("code")
        
        if not language or not code:
            return jsonify({"error": "Both language and code are required."}), 400
        
        prompt = f"Please provide only the raw output of the {language} code I provide. Do not include any explanations, comments, or extra information. If the code asks for inputs, provide the correct inputs and output only—no other remarks. If randomness is involved, give different values each time. For infinite iterations, display only the first 20 outputs followed by dots. First, ensure the code runs correctly: check for any syntax errors, runtime errors, or issues thoroughly. If there are errors, show the exact error message without any modifications or additional details. Be extremely strict in identifying errors and verify all syntax carefully. Output only the result or error, nothing else. The code is:\n{code}"
        
        completion = client.chat.completions.create(
            model="nvidia/llama-3.1-nemotron-70b-instruct",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
            top_p=1,
            max_tokens=1024,
            stream=True
        )

        generated_output = ""
        for chunk in completion:
            if chunk.choices[0].delta.content is not None:
                generated_output += chunk.choices[0].delta.content
        
        content = re.findall(CODE_REGEX, generated_output, re.DOTALL)
        
        if content:
            code_block = content[0]
            if code_block.startswith("\n"):
                code_block = code_block[1:]
            
            return jsonify({"output": code_block})
        else:
            return jsonify({"error": "Cannot give output for this code"}), 400

    except Exception as e:
        return jsonify({"error": f"Failed to get output. Error: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=False)

