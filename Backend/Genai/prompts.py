languages_prompts = {
    "python": """
    Analyze the following Python code:

    {time}

    ```
    {code}
    ```

    Carefully examine the provided code line-by-line and character-by-character. Focus on errors, such as syntax or runtime issues.
    Provide only in plain text format. Do not use markdown.
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
    
    {time}

    ```
    {code}
    ```

    Output:

    Carefully examine the provided code line-by-line and character-by-character. Focus on errors such as syntax or runtime issues.
    Provide only in plain text format. Do not use markdown.
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

    {time}
    
    ```
    {code}
    ```

    Output:

    Carefully examine the provided code line-by-line and character-by-character. Focus on errors such as syntax or runtime issues.
    Provide only in plain text format. Do not use markdown.
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

    {time}

    ```
    {code}
    ```

    Output:

    Carefully examine the provided code line-by-line and character-by-character. Focus on errors such as syntax or runtime issues.
    Provide only in plain text format. Do not use markdown.
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

    {time}
    
    ```
    {code}
    ```

    Output:

    Carefully examine the provided code line-by-line and character-by-character. Focus on errors such as syntax or runtime issues.
    Provide only in plain text format. Do not use markdown.
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

    {time}
    
    ```
    {code}
    ```

    Output:

    Carefully examine the provided code line-by-line and character-by-character. Focus on errors such as syntax or runtime issues.
    Provide only in plain text format. Do not use markdown.
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

    {time}
    
    ```
    {code}
    ```

    Output:

    Carefully examine the provided code line-by-line and character-by-character. Focus on errors such as syntax or runtime issues.
    Provide only in plain text format. Do not use markdown.
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

    {time}
    
    ```
    {code}
    ```

    Output:

    Carefully examine the provided code line-by-line and character-by-character. Focus on errors such as syntax or runtime issues.
    Provide only in plain text format. Do not use markdown.
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

    {time}
    
    ```
    {code}
    ```

    Output:

    Carefully examine the provided code line-by-line and character-by-character. Focus on errors such as syntax or simulation issues.
    Provide only in plain text format. Do not use markdown.
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

    {time}
    
    ```
    {code}
    ```

    Output:

    Carefully examine the provided SQL query for potential issues.
    Provide only in plain text format. Do not use markdown.
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

    {time}
    
    ```
    {code}
    ```

    Output:

    Carefully examine the provided MongoDB query for potential issues.
    Provide only in plain text format. Do not use markdown.
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

    {time}
    
    ```
    {code}
    ```

    Output:

    Carefully examine the provided code line-by-line and character-by-character. Focus on errors such as syntax or runtime issues.
    Provide only in plain text format. Do not use markdown.
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

    {time}
    
    ```
    {code}
    ```

    Output:

    Carefully examine the provided code line-by-line and character-by-character. Focus on errors such as syntax or runtime issues.
    Provide only in plain text format. Do not use markdown.
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

    {time}
    
    ```
    {code}
    ```

    Output:

    Carefully examine the provided code line-by-line and character-by-character. Focus on errors such as syntax or runtime issues.
    Provide only in plain text format. Do not use markdown.
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

    {time}
    
    ```
    {code}
    ```

    Output:

    Carefully examine the provided code line-by-line and character-by-character. Focus on errors such as syntax or runtime issues.
    Provide only in plain text format. Do not use markdown.
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

    {time}
    
    ```
    {code}
    ```

    Output:

    Carefully examine the provided code line-by-line and character-by-character. Focus on errors such as syntax or runtime issues.
    Provide only in plain text format. Do not use markdown.
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

    {time}
    
    ```
    {code}
    ```

    Output:

    Carefully examine the provided code line-by-line and character-by-character. Focus on errors such as syntax or runtime issues.
    Provide only in plain text format. Do not use markdown.
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

    {time}
    
    ```
    {code}
    ```

    Output:

    Carefully examine the provided code line-by-line and character-by-character. Focus on errors such as syntax or runtime issues.
    Provide only in plain text format. Do not use markdown.
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

    {time}

    ```
    {code}
    ```

    Output:

    Carefully examine the provided code line-by-line and character-by-character. Focus on errors such as syntax or runtime issues.
    Provide only in plain text format. Do not use markdown.
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

compiler_instruction = """
You are a **deterministic {language} program compiler**.

Your behavior must mirror that of a real-world compiler:
- Accept source code as input.
- If the code is valid, output the exact compiled target code — nothing more, nothing less.
- **If there's an infinite loop or longer than 20 interations, show the first 20 iterations followed by "..."**
- If the code is invalid, output a **precise, compiler-style error message** and halt.
"""

refactor_instruction = """
You are a **deterministic {language} code refactoring engine**.

Your behavior must mirror that of a real-world automated refactoring tool:
- Accept source code as input.
- If the code is valid, output the **refactored version** of the code, preserving its original behavior.
- Refactoring must be **syntactically correct**, **semantically equivalent**, and **follow best practices** (e.g., readability, naming, modularity).
- If the code is invalid, output a **precise, compiler-style error message** and halt.
"""

generate_instruction = """
You are a **deterministic {language} code generator**.

Your behavior must mirror that of a real-world code generation tool:
- Output the **exact source code** that implements the described functionality — nothing more, nothing less.
- The generated code must be **syntactically correct**, **logically sound**, and follow standard conventions.
"""

html_generate_instruction = """
You are a **deterministic HTML generator**.

Your behavior must mirror that of a real-world HTML code generation tool:
- Accept a clear and complete structural or content-based specification as input.
- Output the **exact HTML code** that fulfills the specification — nothing more, nothing less.
- The generated code must be **valid HTML**, well-structured, and semantically appropriate.
"""

css_generate_instruction = """
You are a **deterministic CSS generator**.

Your behavior must mirror that of a real-world CSS generation tool:
- Accept a clear and complete styling specification or design description as input.
- Output the **exact CSS code** required to implement the described styles — nothing more, nothing less.
- The generated CSS must be **syntactically correct**, **valid**, and follow modern best practices.
"""

js_generate_instruction = """
You are a **deterministic JavaScript generator**.

Your behavior must mirror that of a real-world JavaScript code generation tool:
- Accept a clear and complete functional specification or behavior description as input.
- Output the **exact JavaScript code** needed to implement the described behavior — nothing more, nothing less.
- The generated code must be **valid JavaScript**, functionally correct, and follow modern best practices.
"""

html_prompt = """
Generate HTML code for the following project, suitable for placement directly within the `<body>` tag.

    {time}

*INSTRUCTIONS*

*   Exclude all `<html>`, `<head>`, and `<body>` tags.
*   **Absolutely do not include any inline JavaScript** (e.g., `<script>...</script>` within HTML tags, event handlers like `onclick="..."`, or any other form of inline scripting). The HTML should be purely structural.
*   Do not include any inline styles (e.g., `style="..."`), or links to external CSS/JS files *except for essential CDNs as specified below*.
*   Don’t give JavaScript in this HTML code; I will ask for that later.
*   Add the IDs and class names only; no other attributes should be used that are required by JavaScript code.
*   Make it responsive for all the devices.
*   **If the project includes a header or navigation bar, make it mobile-friendly with a hamburger menu for smaller screens.** Structure the HTML to support a toggleable menu.
*   Use proper heading levels in a logical order (e.g., `<h1>` followed by `<h2>`, not jumping to `<h4>`).
*   Use `<button>` for actions and `<a>` for navigation — do not misuse elements.
*   Add `alt` attributes for all `<img>` tags to support accessibility and screen readers.
*   Add Font Awesome icons for visual enhancement and improved UI clarity where appropriate.
*   Use https://placehold.co/HEIGHTxWIDTH or https://picsum.photos/[mode/]WIDTH/HEIGHT[.jpg|.webp][?grayscale][&blur[=level]][&random][#cachebust] instead of images to create placeholder visuals during development or prototyping.
*   Use form elements semantically (e.g., `<label>` for `<input>`) when applicable.
*   Ensure elements are keyboard-accessible — avoid using non-interactive tags (like `<div>`) for clickable elements.
*   Avoid redundant wrappers or excessive nesting — keep the markup clean and purposeful.
*   Use placeholder text or descriptive content where necessary to make the structure understandable during development.
*   All class and id names should follow a consistent naming convention (e.g., kebab-case or BEM).
*   Provide only the code in plain text format. Do not use markdown.


**VERY IMPORTANT**: Regarding external libraries/CDNs:

*   Analyze the project description to determine if it requires a common library (e.g., charting, PDF viewing, calendar UI, rich text editor, carousel, etc.).
*   **Only include CDN links that are absolutely required by the functionality described in the project.**
*   If the project description mentions a specific library (e.g., "Use Bootstrap", "Use Chart.js"), include its official CDN (from jsDelivr, cdnjs, or unpkg) at the bottom of the body section.
*   If a known library is clearly required (e.g., for rendering PDFs, charts, date pickers, modals, maps, etc.), include only the necessary **JavaScript and CSS CDNs** for that library.
*   **Do not include the integrity**
*   If the project description *explicitly mentions* a specific library (e.g., "use Bootstrap"), **include it using the appropriate `<link>` or `<script>` tag within the `<body>` ans use those classes in html code**.
*   If the project requires functionality that is *commonly provided by a well-known library* (e.g., date/time picking, charting, complex UI components) and the project description does *not explicitly forbid* their use, **you *may* include the appropriate CDN link within the `<body>`**.
*   **If including a CDN, use the most common and reputable CDN provider** (e.g., jsDelivr, cdnjs, unpkg).
*   The CDN links should be placed **at the very bottom of the body section** (just before the closing `</body>` tag).
*   **Do not use jQuery unless specifically asked for in the project description**.
*   If the project requires Font Awesome icons or other icons, include the appropriate CDN for it as well.


Project description: {prompt}
"""

css_prompt = """
Generate CSS to style the following HTML.
**If a CSS `CDN version` or styling framework (like Tailwind, etc) is used, simply reference the specific library in the CSS comments without including any HTML code or extra details.**

    {time}

*INSTRUCTIONS*

*   The CSS should be valid and well-formatted.
*   Do not use `@apply` for utility classes or styles.
*   If a styling framework (e.g., Tailwind, Bootstrap) is being used, avoid writing custom CSS unless absolutely necessary. Use the framework’s utility classes and conventions wherever possible.
*   Make the design responsive for various screen sizes using media queries.
*   Use the provided `id` and `class` attributes from the HTML for styling. Do not introduce new selectors based on element types unless absolutely necessary (e.g., styling all `<a>` tags for basic link styles).
*   Prioritize using class names for styling, and use id names only when styling a specific element that is unique on the page.
*   Use modern CSS techniques (flexbox, grid) for layout where appropriate.
*   Make it responsive for all the devices.
*   **If the project includes a header or navigation bar, make it mobile-friendly with a hamburger menu for smaller screens.** Structure the HTML to support a toggleable menu.
*   Add Font Awesome icons for visual enhancement and improved UI clarity where appropriate.
*   Use https://placehold.co/HEIGHTxWIDTH or https://picsum.photos/[mode/]WIDTH/HEIGHT[.jpg|.webp][?grayscale][&blur[=level]][&random][#cachebust] instead of images to create placeholder visuals during development or prototyping.
*   Avoid inline styles unless absolutely necessary — keep styles in the CSS file for maintainability.
*   Keep specificity low to avoid issues with overriding styles later.
*   Minimize the use of `!important` — rely on proper CSS structure instead.
*   Use CSS custom properties (variables) for colors, spacing, etc., to ensure consistency and easier updates.
*   Stick to a consistent naming convention (e.g., BEM or project-specific pattern).
*   Avoid unnecessary nesting if using a preprocessor like SCSS — keep the CSS flat and readable.
*   Use `rem` or `em` units for font sizes and spacing instead of `px` to improve scalability and accessibility.
*   Ensure accessibility (a11y) in your styles — e.g., sufficient color contrast, focus states, readable font sizes, etc.
*   Provide only the code in plain text format. Do not use markdown.


{project_description}

HTML:
```html
{html_content}
```
"""

js_prompt = """
Generate JavaScript to add interactivity to the following HTML.
**Return only the JavaScript code, without including HTML or CSS.**

    {time}

*INSTRUCTIONS*

*   The JavaScript should be valid and well-formatted.
*   Use the provided id and class attributes from the HTML to select elements.
*   Do not use inline event handlers (e.g., onclick). Use event listeners attached with addEventListener.
*   If the project requires complex logic or data manipulation, consider using appropriate JavaScript methods and data structures.
*   If the project requires fetching data from an API, use the fetch API.
*   Add Font Awesome icons for visual enhancement and improved UI clarity where appropriate.
*   Use https://placehold.co/HEIGHTxWIDTH or https://picsum.photos/[mode/]WIDTH/HEIGHT[.jpg|.webp][?grayscale][&blur[=level]][&random][#cachebust] instead of images to create placeholder visuals during development or prototyping.
*   Ensure the JavaScript is unobtrusive and degrades gracefully if JavaScript is disabled.
*   **If the project includes a header or navigation bar, make it mobile-friendly with a hamburger menu for smaller screens.** Structure the HTML to support a toggleable menu.
*   Keep your code modular — use functions to break tasks into logical chunks.
*   Use const and let instead of var for block scoping and cleaner code.
*   Handle errors gracefully — use try/catch where appropriate, especially with async/await and fetch.
*   Use meaningful variable and function names for better readability and maintainability.
*   Avoid deeply nested callbacks — consider using promises or async/await for cleaner asynchronous code.
*   Clean up event listeners when elements are removed from the DOM to prevent memory leaks.
*   Comment complex logic where needed, but avoid redundant or obvious comments.
*   Avoid hardcoding values — use configuration objects or constants where appropriate.
*   Provide only the code in plain text format. Do not use markdown.

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

*INSTRUCTIONS*

*   Exclude all `<html>`, `<head>`, and `<body>` tags.
*   **Absolutely do not include any inline JavaScript** (e.g., `<script>...</script>` within HTML tags, event handlers like `onclick="..."`, or any other form of inline scripting). The HTML should be purely structural.
*   **Absolutely do not include any inline CSS** (e.g., `<style>...</style>` within HTML tags. The HTML should be purely structural.
*   Do not include any inline styles (e.g., `style="..."`), or links to external CSS/JS files *except for essential CDNs as specified below*.
*   Don’t give JavaScript in this HTML code; I will ask for that later.
*   Add the IDs and class names only; no other attributes should be used that are required by JavaScript code.
*   Make it responsive for all the devices.
*   **If the project includes a header or navigation bar, make it mobile-friendly with a hamburger menu for smaller screens.** Structure the HTML to support a toggleable menu.
*   Use proper heading levels in a logical order (e.g., `<h1>` followed by `<h2>`, not jumping to `<h4>`).
*   Use `<button>` for actions and `<a>` for navigation — do not misuse elements.
*   Add `alt` attributes for all `<img>` tags to support accessibility and screen readers.
*   Use form elements semantically (e.g., `<label>` for `<input>`) when applicable.
*   Use https://placehold.co/HEIGHTxWIDTH or https://picsum.photos/[mode/]WIDTH/HEIGHT[.jpg|.webp][?grayscale][&blur[=level]][&random][#cachebust] instead of images to create placeholder visuals during development or prototyping.
*   Ensure elements are keyboard-accessible — avoid using non-interactive tags (like `<div>`) for clickable elements.
*   Avoid redundant wrappers or excessive nesting — keep the markup clean and purposeful.
*   Use placeholder text or descriptive content where necessary to make the structure understandable during development.
*   All class and id names should follow a consistent naming convention (e.g., kebab-case or BEM).

**VERY IMPORTANT**: Regarding external libraries/CDNs:

*   Analyze the project description to determine if it requires a common library (e.g., charting, PDF viewing, calendar UI, rich text editor, carousel, etc.).
*   **Only include CDN links that are absolutely required by the functionality described in the project.**
*   If the project description mentions a specific library (e.g., "Use Bootstrap", "Use Chart.js"), include its official CDN (from jsDelivr, cdnjs, or unpkg) at the bottom of the body section.
*   If a known library is clearly required (e.g., for rendering PDFs, charts, date pickers, modals, maps, etc.), include only the necessary **JavaScript and CSS CDNs** for that library.
*   **Do not include the integrity**
*   If the project description *explicitly mentions* a specific library (e.g., "use Bootstrap"), **include it using the appropriate `<link>` or `<script>` tag within the `<body>` ans use those classes in html code**.
*   If the project requires functionality that is *commonly provided by a well-known library* (e.g., date/time picking, charting, complex UI components) and the project description does *not explicitly forbid* their use, **you *may* include the appropriate CDN link within the `<body>`**.
*   **If including a CDN, use the most common and reputable CDN provider** (e.g., jsDelivr, cdnjs, unpkg).
*   The CDN links should be placed **at the very bottom of the body section** (just before the closing `</body>` tag).
*   **Do not use jQuery unless specifically asked for in the project description**.
*   If the project requires Font Awesome icons or other icons, include the appropriate CDN for it as well.


HTML:
```html
{html_content}
```
"""

refactor_css_prompt = """
Refactor CSS to style the following HTML.
**If a CSS `CDN version` or styling framework (like Tailwind, etc) is used, simply reference the specific library in the CSS comments without including any HTML code or extra details.**

*INSTRUCTIONS*

*   The CSS should be valid and well-formatted.
*   Remove custom css if frame works are used.
*   Do not use `@apply` for utility classes or styles. If it's present, please remove it.
*   If a styling framework (e.g., Tailwind, Bootstrap) is being used, avoid writing custom CSS unless absolutely necessary. Use the framework’s utility classes and conventions wherever possible.
*   Make the design responsive for various screen sizes using media queries.
*   Use the provided `id` and `class` attributes from the HTML for styling. Do not introduce new selectors based on element types unless absolutely necessary (e.g., styling all `<a>` tags for basic link styles).
*   Prioritize using class names for styling, and use id names only when styling a specific element that is unique on the page.
*   Use modern CSS techniques (flexbox, grid) for layout where appropriate.
*   Make it responsive for all the devices.
*   **If the project includes a header or navigation bar, make it mobile-friendly with a hamburger menu for smaller screens.** Structure the HTML to support a toggleable menu.
*   Avoid inline styles unless absolutely necessary — keep styles in the CSS file for maintainability.
*   Keep specificity low to avoid issues with overriding styles later.
*   Minimize the use of `!important` — rely on proper CSS structure instead.
*   Use CSS custom properties (variables) for colors, spacing, etc., to ensure consistency and easier updates.
*   Use https://placehold.co/HEIGHTxWIDTH or https://picsum.photos/[mode/]WIDTH/HEIGHT[.jpg|.webp][?grayscale][&blur[=level]][&random][#cachebust] instead of images to create placeholder visuals during development or prototyping.
*   Stick to a consistent naming convention (e.g., BEM or project-specific pattern).
*   Avoid unnecessary nesting if using a preprocessor like SCSS — keep the CSS flat and readable.
*   Use `rem` or `em` units for font sizes and spacing instead of `px` to improve scalability and accessibility.
*   Ensure accessibility (a11y) in your styles — e.g., sufficient color contrast, focus states, readable font sizes, etc.

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

*INSTRUCTIONS*

*   The JavaScript should be valid and well-formatted.
*   Use the provided id and class attributes from the HTML to select elements.
*   Do not use inline event handlers (e.g., onclick). Use event listeners attached with addEventListener.
*   If the project requires complex logic or data manipulation, consider using appropriate JavaScript methods and data structures.
*   If the project requires fetching data from an API, use the fetch API.
*   Ensure the JavaScript is unobtrusive and degrades gracefully if JavaScript is disabled.
*   **If the project includes a header or navigation bar, make it mobile-friendly with a hamburger menu for smaller screens.** Structure the HTML to support a toggleable menu.
*   Keep your code modular — use functions to break tasks into logical chunks.
*   Use const and let instead of var for block scoping and cleaner code.
*   Handle errors gracefully — use try/catch where appropriate, especially with async/await and fetch.
*   Use meaningful variable and function names for better readability and maintainability.
*   Use https://placehold.co/HEIGHTxWIDTH or https://picsum.photos/[mode/]WIDTH/HEIGHT[.jpg|.webp][?grayscale][&blur[=level]][&random][#cachebust] instead of images to create placeholder visuals during development or prototyping.
*   Avoid deeply nested callbacks — consider using promises or async/await for cleaner asynchronous code.
*   Clean up event listeners when elements are removed from the DOM to prevent memory leaks.
*   Comment complex logic where needed, but avoid redundant or obvious comments.
*   Test across browsers to ensure compatibility, especially for features like fetch and newer APIs.
*   Avoid hardcoding values — use configuration objects or constants where appropriate.

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

refactor_html_prompt_user = """
Refactor HTML code for the following project, suitable for placement directly within the `<body>` tag.
**If styling frameworks like Tailwind or Bootstrap, don't remove them—just improve them.**

*INSTRUCTIONS*

*   Exclude all `<html>`, `<head>`, and `<body>` tags.
*   **Absolutely do not include any inline JavaScript** (e.g., `<script>...</script>` within HTML tags, event handlers like `onclick="..."`, or any other form of inline scripting). The HTML should be purely structural.
*   **Absolutely do not include any inline CSS** (e.g., `<style>...</style>` within HTML tags. The HTML should be purely structural.
*   **Do not include any inline styles (e.g., `style="..."`), or links to external CSS/JS files except for essential CDNs as specified below.**
*   Use https://placehold.co/HEIGHTxWIDTH or https://picsum.photos/[mode/]WIDTH/HEIGHT[.jpg|.webp][?grayscale][&blur[=level]][&random][#cachebust] instead of images to create placeholder visuals during development or prototyping.

**VERY IMPORTANT**: Regarding external libraries/CDNs:

*   **Do not use external libraries/CDNs if they are not required by the project. Do not include the integrity**
*   If the project description *explicitly mentions* a specific library (e.g., "use Bootstrap"), **include it using the appropriate `<link>` or `<script>` tag within the `<body>`**.
*   If the project requires functionality that is *commonly provided by a well-known library* (e.g., date/time picking, charting, complex UI components) and the project description does *not explicitly forbid* their use, **you *may* include the appropriate CDN link within the `<body>`**.
*   **If including a CDN, use the most common and reputable CDN provider** (e.g., jsDelivr, cdnjs, unpkg).
*   **Include only those CDNs that are *directly relevant* to the functionality of the page as described in the project description**.
*   The CDN links should be placed **at the very bottom of the body section** (just before the closing `</body>` tag).
*   **Do not use jQuery unless specifically asked for in the project description**.

Problem statement:

{problem_description}

HTML:
```html
{html_content}
```
"""

refactor_css_prompt_user = """
Refactor CSS to style the following HTML.
**If a CSS `CDN version` or styling framework (like Tailwind, etc) is used, simply reference the specific library in the CSS comments without including any HTML code or extra details.**

*INSTRUCTIONS*

*   The CSS should be valid and well-formatted.
*   Remove custom css if frame works are used.
*   Use https://placehold.co/HEIGHTxWIDTH or https://picsum.photos/[mode/]WIDTH/HEIGHT[.jpg|.webp][?grayscale][&blur[=level]][&random][#cachebust] instead of images to create placeholder visuals during development or prototyping.
*   Do not use `@apply` for utility classes or styles. If it's present, please remove it.

Problem statement:

{problem_description}

HTML:
```html
{html_content}
```

CSS:
```css
{css_content}
```
"""

refactor_js_prompt_user = """
Refactor JavaScript to add interactivity to the following HTML.
**Return only the JavaScript code, without including HTML or CSS.**

Problem statement:

{problem_description}

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

*INSTRUCTIONS*

Provide *only* one complete, runnable code solution.
Provide only the code in plain text format. Do not use markdown.
Do *not* include any explanations, markdown formatting, headers, or any other extraneous text.
Include concise inline comments within the code to explain the logic and important steps.
The code must produce some visible output (e.g., by printing to the console).
If the problem cannot be solved in {language}, return "Cannot generate code for this problem in {language}."
"""

refactor_code_prompt = """
Refactor the following code written in {language}. Focus on fixing errors, improving readability, and following common coding conventions for the language.

```
{code}
```

This was the output of the {language} code:

{output}

*INSTRUCTIONS*

Provide *only* the corrected and refactored code. Do *not* include any explanations, markdown formatting, headers, or any other extraneous text.
Provide only the code in plain text format. Do not use markdown.
If there are errors in the original code, indicate them with inline comments in the corrected code, following this format: `error: [Specific error message]`.

If the code is already correct and well-formatted, simply return the original code. If the code cannot be parsed as valid {language}, return "Language not supported."
"""

refactor_code_prompt_user = """
Refactor the following code written in {language}.

Problem statement:

{problem_description}

```
{code}
```

This was the output of the {language} code:

{output}

*INSTRUCTIONS*

Provide *only* the corrected and refactored code. Do *not* include any explanations, markdown formatting, headers, or any other extraneous text.
Provide only the code in plain text format. Do not use markdown.
If there are errors in the original code, indicate them with inline comments in the corrected code, following this format: `error: [Specific error message]`.

If the code is already correct and well-formatted, simply return the original code. If the code cannot be parsed as valid {language}, return "Language not supported."
"""
