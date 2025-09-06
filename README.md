An Online IDE with login functionality enables users to run code, generate new code refactor existing code through secure login  and share the code with anyone.

![Homepage](Images/Homepage.png)

![Lines of code](https://sloc.xyz/github/gladw-in/online-ide)

## Structure of a `.env` File

```dotenv
#Frontend
VITE_GEMINI_API_URL=
VITE_BACKEND_API_URL=
VITE_TEMP_SHARE_URL= #same as TEMP_FILE_URL
VITE_RECAPTCHA_SITE_KEY=
VITE_GOOGLE_CLIENT_ID=

#Login
MONGO_URI=
JWT_SECRET=
PORT=
OTP_EMAIL_SERVICE=
OTP_EMAIL_USER=
OTP_EMAIL_PASS=
RECAPTCHA_SECRET_KEY=
GOOGLE_CLIENT_ID= #same as VITE_GOOGLE_CLIENT_ID

#GenAi
GEMINI_API_KEY=
GEMINI_MODEL=
GEMINI_MODEL_1=
JWT_SECRET= #same from Login
RECAPTCHA_SECRET_KEY= #same as Login

#TempFile
REDIS_HOST=
REDIS_PASSWORD=
REDIS_PORT=6379
TEMP_FILE_URL= #same as VITE_TEMP_SHARE_URL
JWT_SECRET= #same from Login
RECAPTCHA_SECRET_KEY= #same as Login
```

## Diagram

![Diagram](Images/Diagram.png)

## Frontend Dependencies:
- **[monaco-editor](https://microsoft.github.io/monaco-editor/)**: A fast code editor React wrapper, commonly used in applications like Visual Studio Code.
- **[lodash](https://lodash.com/)**: A utility library with helpful functions for working with arrays, objects, and other JavaScript data types.
- **[react](https://reactjs.org/)**: A JavaScript library for building declarative, component-based user interfaces.
- **[react-icons](https://react-icons.github.io/react-icons/)**: A collection of customizable icons for React applications.
- **[react-router](https://reactrouter.com/)**: A library for adding dynamic routing and navigation capabilities to React applications.
- **[terser](https://github.com/terser/terser)**: A fast JavaScript minifier used with bundlers like Rollup to optimize file sizes.
- **[sweetalert2](https://sweetalert2.github.io/)**: A customizable library for creating responsive, beautiful popup alerts in JavaScript applications.
- **[sass](https://github.com/sass/sass)**: A modern version of Sass embedded for improved performance and support for advanced CSS features.
- **[tailwindcss](https://tailwindcss.com/)**: A utility-first CSS framework designed for rapid styling with predefined classes.
- **[tailwindcss-motion](https://github.com/romboHQ/tailwindcss-motion)**: A plugin for adding animations and transitions to Tailwind CSS projects.
- **[vite](https://vitejs.dev/)**: A fast build tool and development server for modern frontend development, featuring hot module replacement (HMR).
- **[react-oauth/google](https://www.npmjs.com/package/@react-oauth/google)**: A React wrapper for Google OAuth integration, providing easy authentication with Google accounts.
- **[react-google-recaptcha-v3](https://www.npmjs.com/package/react-google-recaptcha-v3)**: A React component for integrating Google reCAPTCHA v3 to protect your application from spam and abuse.

## Backend Dependencies:
- **[bcryptjs](https://github.com/dcodeIO/bcrypt.js)**: A JavaScript library for securely hashing passwords using the bcrypt algorithm.
- **[body-parser](https://github.com/expressjs/body-parser)**: Middleware to parse incoming request bodies in JSON or URL-encoded format.  
- **[cors](https://expressjs.com/en/resources/middleware/cors.html)**: A Node.js package that enables Cross-Origin Resource Sharing (CORS) for handling requests from different origins.
- **[dotenv](https://dotenvx.com/)**: A module that loads environment variables from a `.env` file into `process.env`.
- **[express](https://expressjs.com/)**: A minimal and flexible Node.js web framework for building web and mobile applications.
- **[jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)**: A library for creating and verifying JSON Web Tokens (JWT) to securely transmit data between parties.
- **[mongoose](https://mongoosejs.com/)**: A MongoDB Object Data Modeling (ODM) library for Node.js, offering schema-based data modeling.
- **[crypto](https://nodejs.org/api/crypto.html)**: A Node.js core module that provides cryptographic functionality, such as hashing, HMAC, and encryption.
- **[nodemailer](https://nodemailer.com/)**: A module for sending emails from Node.js applications using SMTP, with support for attachments and HTML content.
- **[path](https://nodejs.org/api/path.html)**: A Node.js core module for working with file and directory paths.
- **[axios](https://axios-http.com/)**: A popular promise-based HTTP client for making requests from Node.js and browsers, often used for interacting with APIs.
- **[google-auth-library](https://github.com/googleapis/google-auth-library-nodejs)**: A library for authenticating with Google services, used to handle OAuth 2.0 authorization in Node.js.

## Python Libraries:
- **[google-genai](https://ai.google.dev/gemini-api/docs/quickstart?lang=python)**: A collection of Google APIs and tools for integrating generative AI models into applications.
- **[python-dotenv](https://pypi.org/project/python-dotenv/)**: A Python library for loading environment variables from a `.env` file into the environment.
- **[flask_cors](https://flask-cors.readthedocs.io/en/latest/)**: A Flask extension to handle Cross-Origin Resource Sharing (CORS) and allow requests from different origins.
- **[flask](https://flask.palletsprojects.com/)**: A lightweight Python web framework used for building web applications.
- **[os](https://docs.python.org/3/library/os.html)**: A module in Python providing a way of using operating system-dependent functionality, such as reading or writing to the file system.
- **[re](https://docs.python.org/3/library/re.html)**: A module in Python used for working with regular expressions, allowing pattern matching and text manipulation.
- **[redis](https://pypi.org/project/redis/)**: A Python client for interacting with Redis, an in-memory data structure store, used for caching, message brokering, and more.
- **[uuid](https://docs.python.org/3/library/uuid.html)**: A Python module for generating universally unique identifiers (UUIDs), useful for creating unique keys or identifiers.
- **[datetime](https://docs.python.org/3/library/datetime.html)**: A module in Python for manipulating dates and times, including working with time zones and formatting.
- **[pyjwt](https://pyjwt.readthedocs.io/en/stable/)**: A library for encoding and decoding JSON Web Tokens (JWT), commonly used for authentication in web applications.
- **[functools](https://docs.python.org/3/library/functools.html)**: A module in Python providing higher-order functions to work with functions and callable objects, such as `wraps`.
- **[requests](https://docs.python-requests.org/en/latest/)**: A simple HTTP library for Python, used for making HTTP requests like GET, POST, PUT, DELETE, etc., with ease and flexibility.

## How to Set Up and Use

To set up and run:

### What You Need

- [Node.js](https://nodejs.org/) (latest version)
- npm (usually comes with Node.js)
- [Git](https://git-scm.com/) (version control system)
- [Python](https://www.python.org/) (latest version)
- [Pip](https://pip.pypa.io/en/stable/) Python package installer

## Clone the repository:
```
git clone --depth 1 https://github.com/gladw-in/online-ide.git
```

## Backend Login

1. Go to the Backend/Login folder:
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

### Note: 
Ensure that **Genai** and **TempFile** are assigned different ports.

*You can modify the port by:*
```python
if __name__ == "__main__":
    app.run(debug=False, port = <port>)
```

## GenAi

1. Go to the Backend/Genai folder:
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

## TempFile

1. Go to the Backend/TempFile folder:
```
cd Backend/TempFile
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

## Frontend

1. Go to the Frontend folder:
```
cd ./Frontend
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

### Verilog
![Verilog](Images/Verilog.png)

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