import subprocess
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import re
from typing import Dict, Any

app = Flask(__name__)
cors = CORS(app)

FORBIDDEN_MODULES = (
    "os",
    "sys",
    "subprocess",
    "pickle",
    "multiprocessing",
    "shutil",
    "requests",
    "threading",
    "asyncio",
    "inspect",
    "logging",
    "xml",
    "json",
    "pprint",
    "fileinput",
    "configparser",
    "webbrowser",
    "socketserver",
    "bz2",
    "gzip",
    "zipfile",
    "socket",
    "ctypes",
    "cffi",
    "smtplib",
    "email",
    "hashlib",
    "trace",
    "pdb",
    "tkinter",
    "PyQt5",
    "PySide2",
    "wxPython",
    "Kivy",
    "pyglet",
    "PyGTK",
    "Dear PyGui",
    "PySimpleGUI",
    "FLTK",
    "turtle",
    "http",
    "sqlite3",
)

FORBIDDEN_IMPORTS = (
    r'__import__\s*\(\s*["\']\b({})\b["\']\s*\)'.format("|".join(FORBIDDEN_MODULES)),
    r'import\s+(\w+)\s+as\s+(\w+),(\w+)'.format("|".join(FORBIDDEN_MODULES)),
    r'\bimport\s+(?:\w+\s*,\s*)*\b({})\b'.format("|".join(FORBIDDEN_MODULES)),
    r'\bimport\s+(?:\w+\s+as\s+)?\b({})\b'.format("|".join(FORBIDDEN_MODULES)),
    r'\bimport\s*(?:\w+\s*,\s*)*({})\s*(?:as\s+\w+)?'.format("|".join(FORBIDDEN_MODULES)),
    r'\bimport\s+(?:\w+\s+as)({})\b'.format("|".join(FORBIDDEN_MODULES)),
    r'\bimport\s+(?:\w+\s*,)*\s*({})\b'.format("|".join(FORBIDDEN_MODULES)),
    r'import\s+(?:\w+\s+as\s+)?\b({})\b'.format("|".join(FORBIDDEN_MODULES)),
    r'import\s+(?:\w+\s+as\s+)?\b({})\b\s*(?:,\s*\b({})\b)*'.format("|".join(FORBIDDEN_MODULES), "|".join(FORBIDDEN_MODULES)),
    r'import\s+(?:\w+\s+as\s+)?({})\s*,\s*({})'.format("|".join(FORBIDDEN_MODULES), "|".join(FORBIDDEN_MODULES)),
    r'import\s+(?:\w+\s+as\s+)?\b({})\b(?:,\s*\b({})\b)*'.format("|".join(FORBIDDEN_MODULES), "|".join(FORBIDDEN_MODULES)),
    r'from\s+\b({})\b\s+import\s+\w+'.format("|".join(FORBIDDEN_MODULES)),
    r'from\s+\b({})\b\s+import\s+\*'.format("|".join(FORBIDDEN_MODULES)),
    r'from\s+\b({})\b\s+import\s*\*'.format("|".join(FORBIDDEN_MODULES)),
)

@app.route("/")
def index() -> str:
    return render_template("index.html")

def is_code_safe(code: str) -> bool:
    combined_pattern = '|'.join(FORBIDDEN_IMPORTS)
    return not re.search(combined_pattern, code)

@app.route("/run", methods=["POST"])
def run_code() -> Dict[str, Any]:
    code: str = request.data.decode("utf-8")
    try:
        if not code.strip():
            return jsonify({"output": "No code provided."})

        if not is_code_safe(code):
            output_message = (
                "Please avoid the following:\n{}\n"
                "Ensure your code only contains safe mathematical expressions or safe operations."
            ).format("\n".join(", ".join(FORBIDDEN_MODULES[i:i+3]) for i in range(0, len(FORBIDDEN_MODULES), 3)))

            return jsonify({"output": output_message})

        process = subprocess.Popen(
            ["python"],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True,
        )

        try:
            stdout, stderr = process.communicate(input=code, timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
            stdout, stderr = process.communicate()
            result = "Timeout: The code took too long to execute."
        else:
            if process.returncode == 0:
                result = stdout
            else:
                result = f"Error: {stderr}"

    except Exception as e:
        result = f"An unexpected error occurred: {str(e)}"

    return jsonify({"output": result})


if __name__ == "__main__":
    app.run(debug=False, port=5000)
