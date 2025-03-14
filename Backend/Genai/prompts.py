languages_prompts = {
    "python": """
    Analyze the following Python code:

    ```
    {code}
    ```

    Carefully examine the provided code line-by-line and character-by-character. Focus on errors, such as syntax or runtime issues.
    **If the snippet is a comment, then do not execute the commented snippet.**

    If errors are found:
    - Syntax errors: Provide the most probable error message a Python interpreter would report.
    - Runtime errors: Provide a clear description (e.g., "Division by zero", "Index out of bounds").
    - Only provide the error message, not the code or explanations.
    - Check if there is any spelling mistake in the words (e.g., "sel f", "sprint")
    - Review the code repeatedly to ensure it is error-free before proceeding with the output.

    If the code is completely error-free:
    - If there's an infinite loop, show the first 20 iterations followed by "..."
    - If the code uses randomness, show the output with different values for each run.
    - Otherwise, show the full output.

    If the code is not valid Python:
    - Output: "Language not supported."
    """,
    "javascript": """
    Analyze the following JavaScript code:
    
    ```
    {code}
    ```

    Output:

    Carefully examine the provided code line-by-line and character-by-character. Focus on errors such as syntax or runtime issues.
    **If the snippet is a comment, then do not execute the commented snippet.**

    If errors are found:
    - Syntax errors: Provide the most probable error message a JavaScript interpreter would report.
    - Runtime errors: Provide a clear description (e.g., "TypeError", "ReferenceError").
    - Only provide the error message, not the code or explanations.
    - Review the code repeatedly to ensure it is error-free before proceeding with the output.

    If the code is likely error-free:
    - If there's an infinite loop, show the first 20 iterations followed by "..."
    - If the code uses randomness, show the output with different values for each run.
    - Otherwise, show the full output.

    If the code is not valid JavaScript:
    - Output: "Language not supported."
    """,
    "c": """
    Analyze the following C code:

    ```
    {code}
    ```

    Output:

    Carefully examine the provided code line-by-line and character-by-character. Focus on errors such as syntax or runtime issues.
    **If the snippet is a comment, then do not execute the commented snippet.**

    If errors are found:
    - Syntax errors: Provide the most probable error message a C compiler would report (e.g., "expected ‘;’ before").
    - Runtime errors: Provide a clear description (e.g., "Segmentation fault").
    - Only provide the error message, not the code or explanations.
    - Review the code repeatedly to ensure it is error-free before proceeding with the output.

    If the code is likely error-free:
    - If there's an infinite loop, show the first 20 iterations followed by "..."
    - If the code uses randomness, show the output with different values for each run.
    - Otherwise, show the full output.

    If the code is not valid C:
    - Output: "Language not supported."
    """,
    "cpp": """
    Analyze the following C++ code:

    ```
    {code}
    ```

    Output:

    Carefully examine the provided code line-by-line and character-by-character. Focus on errors such as syntax or runtime issues.
    **If the snippet is a comment, then do not execute the commented snippet.**

    If errors are found:
    - Syntax errors: Provide the most probable error message a C++ compiler would report (e.g., "expected ‘;’ before").
    - Runtime errors: Provide a clear description (e.g., "Segmentation fault", "NullPointerException").
    - Only provide the error message, not the code or explanations.
    - Review the code repeatedly to ensure it is error-free before proceeding with the output.

    If the code is likely error-free:
    - If there's an infinite loop, show the first 20 iterations followed by "..."
    - If the code uses randomness, show the output with different values for each run.
    - Otherwise, show the full output.

    If the code is not valid C++:
    - Output: "Language not supported."
    """,
    "java": """
    Analyze the following Java code:

    ```
    {code}
    ```

    Output:

    Carefully examine the provided code line-by-line and character-by-character. Focus on errors such as syntax or runtime issues.
    **If the snippet is a comment, then do not execute the commented snippet.**

    If errors are found:
    - Syntax errors: Provide all the most probable error message a Java compiler would report.
    - Runtime errors: Provide a clear description (e.g., "NullPointerException", "ArrayIndexOutOfBoundsException").
    - Only provide the error message, not the code or explanations.
    - Review the code repeatedly to ensure it is error-free before proceeding with the output.

    If the code is likely error-free:
    - If there's an infinite loop, show the first 20 iterations followed by "..."
    - If the code uses randomness, show the output with different values for each run.
    - Otherwise, show the full output.

    If the code is not valid Java:
    - Output: "Language not supported."
    """,
    "csharp": """
    Analyze the following C# code:

    ```
    {code}
    ```

    Output:

    Carefully examine the provided code line-by-line and character-by-character. Focus on errors such as syntax or runtime issues.
    **If the snippet is a comment, then do not execute the commented snippet.**

    If errors are found:
    - Syntax errors: Provide the most probable error message a C# compiler would report (e.g., "CS1002: ; expected").
    - Runtime errors: Provide a clear description (e.g., "NullReferenceException", "IndexOutOfRangeException").
    - Only provide the error message, not the code or explanations.
    - Review the code repeatedly to ensure it is error-free before proceeding with the output.

    If the code is likely error-free:
    - If there's an infinite loop, show the first 20 iterations followed by "..."
    - If the code uses randomness, show the output with different values for each run.
    - Otherwise, show the full output.

    If the code is not valid C#:
    - Output: "Language not supported."
    """,
    "rust": """
    Analyze the following Rust code:

    ```
    {code}
    ```

    Output:

    Carefully examine the provided code line-by-line and character-by-character. Focus on errors such as syntax or runtime issues.
    **If the snippet is a comment, then do not execute the commented snippet.**

    If errors are found:
    - Syntax errors: Provide the most probable error message a Rust compiler would report (e.g., "unexpected closing delimiter").
    - Runtime errors: Provide a clear description (e.g., "panic occurred", "borrow checker error").
    - Only provide the error message, not the code or explanations.
    - Review the code repeatedly to ensure it is error-free before proceeding with the output.

    If the code is likely error-free:
    - If there's an infinite loop, show the first 20 iterations followed by "..."
    - If the code uses randomness, show the output with different values for each run.
    - Otherwise, show the full output.

    If the code is not valid Rust:
    - Output: "Language not supported."
    """,
    "go": """
    Analyze the following Go code:

    ```
    {code}
    ```

    Output:

    Carefully examine the provided code line-by-line and character-by-character. Focus on errors such as syntax or runtime issues.
    **If the snippet is a comment, then do not execute the commented snippet.**

    If errors are found:
    - Syntax errors: Provide the most probable error message a Go compiler would report (e.g., "syntax error: unexpected ...").
    - Runtime errors: Provide a clear description (e.g., "panic: runtime error").
    - Only provide the error message, not the code or explanations.
    - Review the code repeatedly to ensure it is error-free before proceeding with the output.

    If the code is likely error-free:
    - If there's an infinite loop, show the first 20 iterations followed by "..."
    - If the code uses randomness, show the output with different values for each run.
    - Otherwise, show the full output.

    If the code is not valid Go:
    - Output: "Language not supported."
    """,
    "verilog": """
    Analyze the following verilog code:

    ```
    {code}
    ```

    Output:

    Carefully examine the provided code line-by-line and character-by-character. Focus on errors such as syntax or simulation issues.
    **If the snippet is a comment, then do not execute the commented snippet.**

    If errors are found:
    - Syntax errors: Provide the most probable error message a Verilog simulator would report (e.g., "Syntax error in module declaration").
    - Simulation errors: Provide a clear description (e.g., "Unknown variable", "Undefined state").
    - Only provide the error message, not the code or explanations.
    - Review the code repeatedly to ensure it is error-free before proceeding with the output.

    If the code is likely error-free:
    - If there's an infinite loop in the simulation, show the first 20 iterations followed by "..."
    - If the code involves randomization or non-deterministic behavior, show the output with different values for each run.
    - Otherwise, show the full output of the simulation.

    If the code is not valid Verilog:
    - Output: "Language not supported."
    """,
    "sql": """
    Analyze the following SQL query:

    ```
    {code}
    ```

    Output:

    Carefully examine the provided SQL query for potential issues.
    **If the snippet is a comment, then do not execute the commented snippet.**

    If errors are found:
    - Syntax errors: Provide the most probable error message a SQL engine would report (e.g., "Syntax error near...").
    - Runtime errors: Provide a clear description (e.g., "Table not found", "Column does not exist").
    - Only provide the error message, not the code or explanations.
    - Review the code repeatedly to ensure it is error-free before proceeding with the output.

    If the query is likely error-free:
    - If the query would return results, show a sample output (if possible).
    - Otherwise, indicate if the query would run successfully without returning results.

    *Use this format and exact border style:*

    If the query is not valid SQL:
    - Output: "Language not supported."
    """,
    "mongodb": """
    Analyze the following MongoDB query:

    ```
    {code}
    ```

    Output:

    Carefully examine the provided MongoDB query for potential issues.
    **If the snippet is a comment, then do not execute the commented snippet.**

    If errors are found:
    - Syntax errors: Provide the most probable error message a MongoDB engine would report (e.g., "Unexpected token", "Unknown operator").
    - Runtime errors: Provide a clear description (e.g., "No such collection", "Invalid field name").
    - Only provide the error message, not the code or explanations.
    - Review the code repeatedly to ensure it is error-free before proceeding with the output.

    If the query is likely error-free:
    - If the query would return results, show a sample output (if possible).
    - Otherwise, indicate if the query would run successfully without returning results.

    If the query is not valid MongoDB:
    - Output: "Language not supported."
    """,
    "swift": """
    Analyze the following Swift code:

    ```
    {code}
    ```

    Output:

    Carefully examine the provided code line-by-line and character-by-character. Focus on errors such as syntax or runtime issues.
    **If the snippet is a comment, then do not execute the commented snippet.**

    If errors are found:
    - Syntax errors: Provide the most probable error message a Swift compiler would report (e.g., "Expected ‘;’").
    - Runtime errors: Provide a clear description (e.g., "Nil pointer exception", "Index out of range").
    - Only provide the error message, not the code or explanations.
    - Review the code repeatedly to ensure it is error-free before proceeding with the output.

    If the code is likely error-free:
    - If there's an infinite loop, show the first 20 iterations followed by "..."
    - If the code uses randomness, show the output with different values for each run.
    - Otherwise, show the full output.

    If the code is not valid Swift:
    - Output: "Language not supported."
    """,
    "ruby": """
    Analyze the following Ruby code:

    ```
    {code}
    ```

    Output:

    Carefully examine the provided code line-by-line and character-by-character. Focus on errors such as syntax or runtime issues.
    **If the snippet is a comment, then do not execute the commented snippet.**

    If errors are found:
    - Syntax errors: Provide the most probable error message a Ruby interpreter would report (e.g., "syntax error, unexpected ...").
    - Runtime errors: Provide a clear description (e.g., "NoMethodError", "IndexError").
    - Only provide the error message, not the code or explanations.
    - Review the code repeatedly to ensure it is error-free before proceeding with the output.

    If the code is likely error-free:
    - If there's an infinite loop, show the first 20 iterations followed by "..."
    - If the code uses randomness, show the output with different values for each run.
    - Otherwise, show the full output.

    If the code is not valid Ruby:
    - Output: "Language not supported."
    """,
    "typescript": """
    Analyze the following TypeScript code:

    ```
    {code}
    ```

    Output:

    Carefully examine the provided code line-by-line and character-by-character. Focus on errors such as syntax or runtime issues.
    **If the snippet is a comment, then do not execute the commented snippet.**

    If errors are found:
    - Syntax errors: Provide the most probable error message a TypeScript compiler would report (e.g., "Property 'x' does not exist on type 'y'").
    - Runtime errors: Provide a clear description (e.g., "TypeError", "undefined is not a function").
    - Only provide the error message, not the code or explanations.
    - Review the code repeatedly to ensure it is error-free before proceeding with the output.

    If the code is likely error-free:
    - If there's an infinite loop, show the first 20 iterations followed by "..."
    - If the code uses randomness, show the output with different values for each run.
    - Otherwise, show the full output.

    If the code is not valid TypeScript:
    - Output: "Language not supported."
    """,
    "dart": """
    Analyze the following Dart code:

    ```
    {code}
    ```

    Output:

    Carefully examine the provided code line-by-line and character-by-character. Focus on errors such as syntax or runtime issues.
    **If the snippet is a comment, then do not execute the commented snippet.**

    If errors are found:
    - Syntax errors: Provide the most probable error message a Dart compiler would report (e.g., "The method 'x' isn't defined for the class 'y'").
    - Runtime errors: Provide a clear description (e.g., "Null check operator used on a null value").
    - Only provide the error message, not the code or explanations.
    - Review the code repeatedly to ensure it is error-free before proceeding with the output.

    If the code is likely error-free:
    - If there's an infinite loop, show the first 20 iterations followed by "..."
    - If the code uses randomness, show the output with different values for each run.
    - Otherwise, show the full output.

    If the code is not valid Dart:
    - Output: "Language not supported."
    """,
    "kotlin": """
    Analyze the following Kotlin code:

    ```
    {code}
    ```

    Output:

    Carefully examine the provided code line-by-line and character-by-character. Focus on errors such as syntax or runtime issues.
    **If the snippet is a comment, then do not execute the commented snippet.**

    If errors are found:
    - Syntax errors: Provide the most probable error message a Kotlin compiler would report (e.g., "Unresolved reference: x").
    - Runtime errors: Provide a clear description (e.g., "NullPointerException", "IndexOutOfBoundsException").
    - Only provide the error message, not the code or explanations.
    - Review the code repeatedly to ensure it is error-free before proceeding with the output.

    If the code is likely error-free:
    - If there's an infinite loop, show the first 20 iterations followed by "..."
    - If the code uses randomness, show the output with different values for each run.
    - Otherwise, show the full output.

    If the code is not valid Kotlin:
    - Output: "Language not supported."
    """,
    "perl": """
    Analyze the following Perl code:

    ```
    {code}
    ```

    Output:

    Carefully examine the provided code line-by-line and character-by-character. Focus on errors such as syntax or runtime issues.
    **If the snippet is a comment, then do not execute the commented snippet.**

    If errors are found:
    - Syntax errors: Provide the most probable error message a Perl interpreter would report (e.g., "syntax error at ...").
    - Runtime errors: Provide a clear description (e.g., "Undefined subroutine", "Array index out of range").
    - Only provide the error message, not the code or explanations.
    - Review the code repeatedly to ensure it is error-free before proceeding with the output.

    If the code is likely error-free:
    - If there's an infinite loop, show the first 20 iterations followed by "..."
    - If the code uses randomness, show the output with different values for each run.
    - Otherwise, show the full output.

    If the code is not valid Perl:
    - Output: "Language not supported."
    """,
    "scala": """
    Analyze the following Scala code:

    ```
    {code}
    ```

    Output:

    Carefully examine the provided code line-by-line and character-by-character. Focus on errors such as syntax or runtime issues.
    **If the snippet is a comment, then do not execute the commented snippet.**

    If errors are found:
    - Syntax errors: Provide the most probable error message a Scala compiler would report (e.g., "not found: value x").
    - Runtime errors: Provide a clear description (e.g., "NullPointerException", "ArrayIndexOutOfBoundsException").
    - Only provide the error message, not the code or explanations.
    - Review the code repeatedly to ensure it is error-free before proceeding with the output.

    If the code is likely error-free:
    - If there's an infinite loop, show the first 20 iterations followed by "..."
    - If the code uses randomness, show the output with different values for each run.
    - Otherwise, show the full output.

    If the code is not valid Scala:
    - Output: "Language not supported."
    """,
    "julia": """
    Analyze the following Julia code:

    ```
    {code}
    ```

    Output:

    Carefully examine the provided code line-by-line and character-by-character. Focus on errors such as syntax or runtime issues.
    **If the snippet is a comment, then do not execute the commented snippet.**

    If errors are found:
    - Syntax errors: Provide the most probable error message a Julia interpreter would report (e.g., "syntax: unexpected ...").
    - Runtime errors: Provide a clear description (e.g., "MethodError", "BoundsError").
    - Only provide the error message, not the code or explanations.
    - Review the code repeatedly to ensure it is error-free before proceeding with the output.

    If the code is likely error-free:
    - If there's an infinite loop, show the first 20 iterations followed by "..."
    - If the code uses randomness, show the output with different values for each run.
    - Otherwise, show the full output.

    If the code is not valid Julia:
    - Output: "Language not supported."
    """,
}

html_prompt = """
Generate HTML code for the following project, suitable for placement directly within the `<body>` tag.

*   Exclude all `<html>`, `<head>`, and `<body>` tags.
*   **Absolutely do not include any inline JavaScript** (e.g., `<script>...</script>` within HTML tags, event handlers like `onclick="..."`, or any other form of inline scripting). The HTML should be purely structural.
*   Do not include any inline styles (e.g., `style="..."`), or links to external CSS/JS files *except for essential CDNs as specified below*.
*   Don’t give JavaScript in this HTML code; I will ask for that later.
*   Add the IDs and class names only; no other attributes should be used that are required by JavaScript code.
*   Make it responsive for all the devices.

**VERY IMPORTANT**: Regarding external libraries/CDNs:

*   **Do not use external libraries/CDNs if they are not required by the project.**
*   If the project description *explicitly mentions* a specific library (e.g., "use Bootstrap"), **include it using the appropriate `<link>` or `<script>` tag within the `<body>` ans use those classes in html code**.
*   If the project requires functionality that is *commonly provided by a well-known library* (e.g., date/time picking, charting, complex UI components) and the project description does *not explicitly forbid* their use, **you *may* include the appropriate CDN link within the `<body>`**.
*   **If including a CDN, use the most common and reputable CDN provider** (e.g., cdnjs, unpkg).
*   **Include only those CDNs that are *directly relevant* to the functionality of the page as described in the project description**.
*   The CDN links should be placed **at the very bottom of the body section** (just before the closing `</body>` tag).
*   **Do not use jQuery unless specifically asked for in the project description**.

Project description: {prompt}
"""

css_prompt = """
Generate CSS to style the following HTML.
**If a CSS `CDN version` or styling framework (like Tailwind, etc) is used, simply reference the specific library in the CSS comments without including any HTML code or extra details.**

*   The CSS should be valid and well-formatted.
*   Make the design responsive for various screen sizes using media queries.
*   Use the provided `id` and `class` attributes from the HTML for styling. Do not introduce new selectors based on element types unless absolutely necessary (e.g., styling all `<a>` tags for basic link styles).
*   Prioritize using class names for styling, and use id names only when styling a specific element that is unique on the page.
*   Use modern CSS techniques (flexbox, grid) for layout where appropriate.
*   Make it responsive for all the devices.

{project_description}

HTML:
```html
{html_content}
```
"""

js_prompt = """
Generate JavaScript to add interactivity to the following HTML.
**Return only the JavaScript code, without including HTML or CSS.**

*   The JavaScript should be valid and well-formatted.
*   Use the provided id and class attributes from the HTML to select elements.
*   Do not use inline event handlers (e.g., onclick). Use event listeners attached with addEventListener.
*   If the project requires complex logic or data manipulation, consider using appropriate JavaScript methods and data structures.
*   If the project requires fetching data from an API, use the fetch API.
*   Ensure the JavaScript is unobtrusive and degrades gracefully if JavaScript is disabled.

{project_description}

HTML:
```html
{html_content}
```

CSS:
```css
{css_content}
```
"""

refactor_html_prompt = """
Refactor HTML code for the following project, suitable for placement directly within the `<body>` tag.
**If styling frameworks like Tailwind or Bootstrap, don't remove them—just improve them.**

*   Exclude all `<html>`, `<head>`, and `<body>` tags.
*   **Absolutely do not include any inline JavaScript** (e.g., `<script>...</script>` within HTML tags, event handlers like `onclick="..."`, or any other form of inline scripting). The HTML should be purely structural.
*   Do not include any inline styles (e.g., `style="..."`), or links to external CSS/JS files *except for essential CDNs as specified below*.
*   Don’t give JavaScript in this HTML code; I will ask for that later.
*   Add the IDs and class names only; no other attributes should be used that are required by JavaScript code.
*   Make it responsive for all the devices.

**VERY IMPORTANT**: Regarding external libraries/CDNs:

*   **Do not use external libraries/CDNs if they are not required by the project.**
*   If the project description *explicitly mentions* a specific library (e.g., "use Bootstrap"), **include it using the appropriate `<link>` or `<script>` tag within the `<body>`**.
*   If the project requires functionality that is *commonly provided by a well-known library* (e.g., date/time picking, charting, complex UI components) and the project description does *not explicitly forbid* their use, **you *may* include the appropriate CDN link within the `<body>`**.
*   **If including a CDN, use the most common and reputable CDN provider** (e.g., cdnjs, unpkg).
*   **Include only those CDNs that are *directly relevant* to the functionality of the page as described in the project description**.
*   The CDN links should be placed **at the very bottom of the body section** (just before the closing `</body>` tag).
*   **Do not use jQuery unless specifically asked for in the project description**.

HTML:
```html
{html_content}
```
"""

refactor_css_prompt = """
Refactor CSS to style the following HTML.
**If a CSS `CDN version` or styling framework (like Tailwind, etc) is used, simply reference the specific library in the CSS comments without including any HTML code or extra details.**

*   The CSS should be valid and well-formatted.
*   Make the design responsive for various screen sizes using media queries.
*   Use the provided `id` and `class` attributes from the HTML for styling. Do not introduce new selectors based on element types unless absolutely necessary (e.g., styling all `<a>` tags for basic link styles).
*   Prioritize using class names for styling, and use id names only when styling a specific element that is unique on the page.
*   Use modern CSS techniques (flexbox, grid) for layout where appropriate.
*   Make it responsive for all the devices.

HTML:
```html
{html_content}
```

CSS:
```css
{css_content}
```
"""

refactor_js_prompt = """
Refactor JavaScript to add interactivity to the following HTML.
**Return only the JavaScript code, without including HTML or CSS.**

*   The JavaScript should be valid and well-formatted.
*   Use the provided id and class attributes from the HTML to select elements.
*   Do not use inline event handlers (e.g., onclick). Use event listeners attached with addEventListener.
*   If the project requires complex logic or data manipulation, consider using appropriate JavaScript methods and data structures.
*   If the project requires fetching data from an API, use the fetch API.
*   Ensure the JavaScript is unobtrusive and degrades gracefully if JavaScript is disabled.

HTML:
```html
{html_content}
```

CSS:
```css
{css_content}
```

JAVASCRIPT:
```js
{js_content}
```
"""

generate_code_prompt = """
Generate code in {language} that solves the following problem:

{problem_description}

Output:

Provide *only* one complete, runnable code solution. Do *not* include any explanations, markdown formatting, headers, or any other extraneous text. Include concise inline comments within the code to explain the logic and important steps. The code must produce some visible output (e.g., by printing to the console). If the problem cannot be solved in {language}, return "Cannot generate code for this problem in {language}."
"""

refactor_code_prompt = """
Refactor the following code written in {language}. Focus on fixing errors, improving readability, and following common coding conventions for the language.

```
{code}
```

Output:

Provide *only* the corrected and refactored code. Do *not* include any explanations, markdown formatting, headers, or any other extraneous text. If there are errors in the original code, indicate them with inline comments in the corrected code, following this format: `// Error: [Specific error message]`.

If the code is already correct and well-formatted, simply return the original code. If the code cannot be parsed as valid {language}, return "Language not supported."
"""
