An online IDE with login functionality enables users to run code, generate new code, and refactor existing code through secure login.

## Structure of a `.env` File

```dotenv
VITE_NVIDIA_NIM_APP_API_URL=
VITE_BACKEND_API_URL=
MONGO_URI=mongodb+srv://username:pass@cluster0.<abcs1234>.mongodb.net/<databaseName>?retryWrites=true&w=majority
JWT_SECRET=
PORT=
NVIDIA_API_KEY=
```
## How to Set Up and Use

To set up and run:

### What You Need

- [Node.js](https://nodejs.org/) (version 18.0 or newer)
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
### Installation NVIDIA NIM

1. Clone the repository:
```
cd Backend/Nvidia-NIM-api
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

### PHP
![PHP](Images/PHP.png)

### Accounts
![Accounts](Images/Accounts.png)

### Login
![Login](Images/Login.png)

### Register
![Register](Images/Register.png)

## License

You can use this under the MIT License. See [LICENSE](LICENSE) for more details.