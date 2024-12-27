An Online IDE with login functionality enables users to run code, generate new code, and refactor existing code through secure login.

![Lines of code](https://sloc.xyz/github/gladw-in/online-ide)

## Structure of a `.env` File

```dotenv
#Frontend
VITE_GEMINI_API_URL=
VITE_BACKEND_API_URL=
#Login
MONGO_URI=mongodb+srv://username:pass@cluster0.<abcs1234>.mongodb.net/<databaseName>?retryWrites=true&w=majority
JWT_SECRET=
PORT=
#GenAi
GEMINI_API_KEY=
```

## Frontend Dependencies:
- **[monaco-editor](https://microsoft.github.io/monaco-editor/)**: A fast code editor React wrapper, commonly used in applications like Visual Studio Code.
- **[lodash](https://lodash.com/)**: A utility library with helpful functions for working with arrays, objects, and other JavaScript data types.
- **[react](https://reactjs.org/)**: A JavaScript library for building declarative, component-based user interfaces.
- **[react-icons](https://react-icons.github.io/react-icons/)**: A collection of customizable icons for React applications.
- **[react-router](https://reactrouter.com/)**: A library for adding dynamic routing and navigation capabilities to React applications.
- **[rollup](https://rollupjs.org/)**: A plugin for minifying JavaScript code with Terser, improving performance by reducing bundle size.
- **[terser](https://github.com/terser/terser)**: A fast JavaScript minifier used with bundlers like Rollup to optimize file sizes.
- **[sweetalert2](https://sweetalert2.github.io/)**: A customizable library for creating responsive, beautiful popup alerts in JavaScript applications.
- **[autoprefixer](https://github.com/postcss/autoprefixer)**: A PostCSS plugin that automatically adds vendor prefixes to CSS for cross-browser compatibility.
- **[eslint](https://eslint.org/)**: A tool to identify and fix JavaScript code issues, enforcing best practices and style consistency.
- **[globals](https://www.npmjs.com/package/globals)**: A package that provides a list of common global variables used across JavaScript environments for linting.
- **[postcss](https://postcss.org/)**: A tool for transforming CSS with JavaScript plugins, enabling features like autoprefixing and minification.
- **[sass-embedded](https://github.com/sass/sass)**: A modern version of Sass embedded for improved performance and support for advanced CSS features.
- **[tailwindcss](https://tailwindcss.com/)**: A utility-first CSS framework designed for rapid styling with predefined classes.
- **[tailwindcss-motion](https://github.com/romboHQ/tailwindcss-motion)**: A plugin for adding animations and transitions to Tailwind CSS projects.
- **[vite](https://vitejs.dev/)**: A fast build tool and development server for modern frontend development, featuring hot module replacement (HMR).

## Backend Dependencies:
- **[bcryptjs](https://github.com/dcodeIO/bcrypt.js)**: A JavaScript library for securely hashing passwords using the bcrypt algorithm.
- **[cors](https://expressjs.com/en/resources/middleware/cors.html)**: A Node.js package that enables Cross-Origin Resource Sharing (CORS) for handling requests from different origins.
- **[dotenv](https://dotenvx.com/)**: A module that loads environment variables from a `.env` file into `process.env`.
- **[express](https://expressjs.com/)**: A minimal and flexible Node.js web framework for building web and mobile applications.
- **[jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)**: A library for creating and verifying JSON Web Tokens (JWT) to securely transmit data between parties.
- **[mongoose](https://mongoosejs.com/)**: A MongoDB Object Data Modeling (ODM) library for Node.js, offering schema-based data modeling.

## Python Dependencies:
- **[google-generativeai](https://ai.google.dev/gemini-api/docs/quickstart?lang=python)**: A collection of Google APIs and tools for integrating generative AI models into applications.
- **[python-dotenv](https://pypi.org/project/python-dotenv/)**: A Python library for loading environment variables from a `.env` file into the environment.
- **[absl-py](https://github.com/abseil/abseil-py)**: A Python library developed by Google, providing utilities for building scalable and efficient applications.
- **[flask_cors](https://flask-cors.readthedocs.io/en/latest/)**: A Flask extension to handle Cross-Origin Resource Sharing (CORS) and allow requests from different origins.
- **[flask](https://flask.palletsprojects.com/)**: A lightweight Python web framework used for building web applications.

## How to Set Up and Use

To set up and run:

### What You Need

- [Node.js](https://nodejs.org/) (version 20.0 or newer)
- npm (usually comes with Node.js)
- [Git](https://git-scm.com/) (version control system)
- [Python](https://www.python.org/) (version 3.11 or newer)
- [Pip](https://pip.pypa.io/en/stable/) Python package installer

### Installation Frontend

1. Clone the repository:
```
git clone https://github.com/gladw-in/online-ide.git
cd online-ide/Frontend
```

2. Install dependencies:
```
npm install
```

3. Remember to have the **.env**.


### For Development

To start working on the project:

```
npm run dev
```

This starts the development server. Open your web browser and go to `http://localhost:5173` (or the address shown in your terminal) to see the app.

### Building for Release

To make the project ready for release:

```
npm run build
```

This creates optimized files in the `dist` folder.

### Looking at the Release Version

To see how the release version looks:

```
npm run preview
```

### Installation Backend Login

1. Clone the repository:
```
cd Backend/Login
```

2. Install dependencies:
```
npm install
```

3. Remember to have the **.env**.

4. Run the server:
```
node server.js
```
### Installation GenAi

1. Clone the repository:
```
cd Backend/Genai
```

2. Install packages:
```
pip install -r requirements.txt
```

3. Remember to have the **.env**.

4. Run it:
```
python app.py
```

# Screenshots

### Homepage
![Homepage](Images/Homepage.png)

### HTML, CSS, JS
![HTML, CSS, JS](Images/HtmlCssJs.png)

### Python
![Python](Images/Python.png)

### JavaScript
![JavaScript](Images/Javascript.png)

### C
![C](Images/C.png)

### C++
![C++](Images/Cplusplus.png)

### Java
![Java](Images/Java.png)

### C#
![C#](Images/CSharp.png)

### Rust
![Rust](Images/Rust.png)

### Go
![Go](Images/Go.png)

### Shell
![Shell](Images/Shell.png)

### SQL
![SQL](Images/Sql.png)

### MongoDB
![MongoDB](Images/MongoDB.png)

### Swift
![Swift](Images/Swift.png)

### Typescript
![Typescript](Images/Typescript.png)

### Dart
![Dart](Images/Dart.png)

### Kotlin
![Kotlin](Images/Kotlin.png)

### Perl
![Perl](Images/Perl.png)

### Scala
![Scala](Images/Scala.png)

### Julia
![Julia](Images/Julia.png)

### Accounts
![Accounts](Images/Accounts.png)

### Login
![Login](Images/Login.png)

### Register
![Register](Images/Register.png)

## License

You can use this under the MIT License. See [LICENSE](LICENSE) for more details.