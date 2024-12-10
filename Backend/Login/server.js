const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();

const corsOptions = {
	origin: '*',
	methods: ['GET', 'POST', 'PUT', 'DELETE'],
	allowedHeaders: ['Content-Type', 'Authorization'],
	credentials: true,
};

const usernameRegex = /^[a-zA-Z0-9_.-]{3,30}$/;
const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

const updateLanguageCount = (user, countType, language) => {
	switch (language) {
		case 'python':
			user[countType].set('py', (user[countType].get('py') || 0) + 1);
			break;
		case 'javascript':
			user[countType].set('js', (user[countType].get('js') || 0) + 1);
			break;
		case 'HtmlJsCss':
			user[countType].set('HtmlJsCss', (user[countType].get('HtmlJsCss') || 0) + 1);
			break;
		case 'c':
			user[countType].set('c', (user[countType].get('c') || 0) + 1);
			break;
		case 'c++':
			user[countType].set('cpp', (user[countType].get('cpp') || 0) + 1);
			break;
		case 'java':
			user[countType].set('java', (user[countType].get('java') || 0) + 1);
			break;
		case 'c#':
			user[countType].set('cs', (user[countType].get('cs') || 0) + 1);
			break;
		case 'rust':
			user[countType].set('rust', (user[countType].get('rust') || 0) + 1);
			break;
		case 'go':
			user[countType].set('go', (user[countType].get('go') || 0) + 1);
			break;
		case 'php':
			user[countType].set('php', (user[countType].get('php') || 0) + 1);
			break;
		default:
			return false;
	}
	return true;
};

app.use(cors(corsOptions));
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
		unique: true
	},
	email: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	lastLogin: {
		type: Date,
		default: null
	},
	createdDate: {
		type: Date,
		default: Date.now
	},
	generateCodeCount: {
		type: Map,
		of: Number,
		default: {
			py: 0,
			js: 0,
			HtmlJsCss: 0,
			c: 0,
			cpp: 0,
			java: 0,
			cs: 0,
			rust: 0,
			go: 0,
			php: 0
		}
	},
	refactorCodeCount: {
		type: Map,
		of: Number,
		default: {
			py: 0,
			js: 0,
			HtmlJsCss: 0,
			c: 0,
			cpp: 0,
			java: 0,
			cs: 0,
			rust: 0,
			go: 0,
			php: 0
		}
	},
	runCodeCount: {
		type: Map,
		of: Number,
		default: {
			py: 0,
			js: 0,
			HtmlJsCss: 0,
			c: 0,
			cpp: 0,
			java: 0,
			cs: 0,
			rust: 0,
			go: 0,
			php: 0
		}
	}
});

const User = mongoose.model('user', userSchema);

async function checkAndConnectDB() {
	if (mongoose.connection.readyState === 0) {
		try {
			await mongoose.connect(MONGO_URI)
				.then(() => console.log('MongoDB connected'))
				.catch((err) => console.log('Error connecting to MongoDB:', err));
			console.log('MongoDB connected');
		} catch (err) {
			console.error('Error connecting to MongoDB:', err);
			throw new Error('Database connection failed');
		}
	}
}

app.post('/api/register', async (req, res) => {
	const {
		username,
		email,
		password
	} = req.body;

	try {
		await checkAndConnectDB();

		const existingUser = await User.findOne({
			email
		});
		if (existingUser) {
			return res.status(400).json({
				msg: 'User already exists'
			});
		}

		if (!usernameRegex.test(username)) {
			return res.status(400).json({
				msg: 'Username can only contain letters, numbers, underscores, hyphens, and periods (3-30 characters).'
			});
		}

		if (username.length < 5 || username.length > 30) {
			return res.status(400).json({
				msg: 'Username should be between 5 and 30 characters'
			});
		}


		if (!emailRegex.test(email)) {
			return res.status(400).json({
				msg: 'Invalid email format'
			});
		}

		if (password.length < 8) {
			return res.status(400).json({
				msg: 'Password must be at least 8 characters long'
			});
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);
		const currentDate = new Date();
		const ISTDate = new Date(currentDate.getTime() + 5.5 * 60 * 60 * 1000);

		const newUser = new User({
			username,
			email,
			password: hashedPassword,
			lastLogin: null,
			createdDate: ISTDate,
		});

		await newUser.save();

		res.status(201).json({
			msg: 'User registered successfully'
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({
			msg: 'Server error'
		});
	}
});

app.post('/api/login', async (req, res) => {
	const {
		email,
		password
	} = req.body;

	try {
		await checkAndConnectDB();

		const user = await User.findOne({
			email
		});
		if (!user) {
			return res.status(400).json({
				msg: 'Invalid credentials'
			});
		}

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(400).json({
				msg: 'Invalid credentials'
			});
		}

		const currentDate = new Date();
		const ISTDate = new Date(currentDate.getTime() + 5.5 * 60 * 60 * 1000);
		user.lastLogin = ISTDate;
		await user.save();

		const token = jwt.sign({
			userId: user._id
		}, process.env.JWT_SECRET, {
			algorithm: 'HS256'
		});
		res.json({
			token,
			username: user.username
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({
			msg: 'Server error'
		});
	}
});

app.get('/api/protected', async (req, res) => {
	const token = req.headers['authorization']?.split(' ')[1];

	if (!token) {
		return res.status(403).json({
			msg: 'No token provided'
		});
	}

	try {
		await checkAndConnectDB();


		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.userId).select('-password');
		if (!user) {
			return res.status(404).json({
				msg: 'User not found'
			});
		}
		const includeEmail = req.query.email === 'true';

		const response = {
			msg: 'Protected data',
			username: user.username
		};

		if (includeEmail) {
			response.email = user.email;
		}

		res.json(response);
	} catch (err) {
		res.status(403).json({
			msg: 'Invalid or expired token'
		});
	}
});

app.put('/api/change-username', async (req, res) => {
	const {
		newUsername
	} = req.body;
	const token = req.headers['authorization']?.split(' ')[1];

	if (!token) {
		return res.status(403).json({
			msg: 'No token provided'
		});
	}

	if (!newUsername) {
		return res.status(400).json({
			msg: 'New username is required'
		});
	}

	try {
		await checkAndConnectDB();

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.userId);

		if (!user) {
			return res.status(404).json({
				msg: 'User not found'
			});
		}

		const existingUser = await User.findOne({
			username: newUsername
		});
		if (existingUser) {
			return res.status(400).json({
				msg: 'Username is already taken'
			});
		}

		user.username = newUsername;
		await user.save();
		res.json({
			msg: 'Username updated successfully'
		});

	} catch (err) {
		console.error('Error updating username:', err);
		res.status(401).json({
			msg: 'Invalid or expired token',
			error: err.message
		});
	}
});

app.put('/api/change-email', async (req, res) => {
	const {
		newEmail
	} = req.body;
	const token = req.headers['authorization']?.split(' ')[1];

	if (!token) {
		return res.status(403).json({
			msg: 'No token provided'
		});
	}

	if (!newEmail) {
		return res.status(400).json({
			msg: 'New email is required'
		});
	}

	try {
		await checkAndConnectDB();

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.userId);

		if (!user) {
			return res.status(404).json({
				msg: 'User not found'
			});
		}

		const existingUser = await User.findOne({
			email: newEmail
		});
		if (existingUser) {
			return res.status(400).json({
				msg: 'Email is already taken'
			});
		}

		user.email = newEmail;
		await user.save();
		res.json({
			msg: 'Email updated successfully'
		});

	} catch (err) {
		console.error('Error updating email:', err);
		res.status(401).json({
			msg: 'Invalid or expired token'
		});
	}
});

app.put('/api/change-password', async (req, res) => {
	const {
		newPassword,
		confirmPassword
	} = req.body;

	const token = req.headers['authorization']?.split(' ')[1];

	if (!token) {
		return res.status(403).json({
			msg: 'No token provided'
		});
	}

	if (!newPassword || !confirmPassword) {
		return res.status(400).json({
			msg: 'New password and confirm password are required'
		});
	}

	if (newPassword !== confirmPassword) {
		return res.status(400).json({
			msg: 'New password and confirm password do not match'
		});
	}

	try {
		await checkAndConnectDB();

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.userId);

		if (!user) {
			return res.status(404).json({
				msg: 'User not found'
			});
		}

		const hashedPassword = await bcrypt.hash(newPassword, 10);

		user.password = hashedPassword;
		await user.save();

		const newToken = jwt.sign({
			userId: user._id
		}, process.env.JWT_SECRET, {
			algorithm: 'HS256'
		});

		res.json({
			msg: 'Password updated successfully',
			token: newToken,
			username: user.username
		});
	} catch (err) {
		console.error('Error updating password:', err);
		res.status(401).json({
			msg: 'Invalid or expired token'
		});
	}
});

app.delete('/api/account', async (req, res) => {
	const token = req.headers['authorization']?.split(' ')[1];

	if (!token) {
		return res.status(403).json({
			msg: 'No token provided'
		});
	}

	try {
		await checkAndConnectDB();

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.userId);

		if (!user) {
			return res.status(404).json({
				msg: 'User not found'
			});
		}

		await User.findByIdAndDelete(decoded.userId);
		res.json({
			msg: 'Account deleted successfully'
		});
	} catch (err) {
		console.error(err);
		res.status(403).json({
			msg: 'Invalid or expired token'
		});
	}
});

app.post('/api/verify-password', async (req, res) => {
	const {
		password
	} = req.body;
	const token = req.headers['authorization']?.split(' ')[1];
	if (!token) {
		return res.status(403).json({
			msg: 'No token provided'
		});
	}
	try {
		await checkAndConnectDB();

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.userId);
		if (!user) {
			return res.status(404).json({
				msg: 'User not found'
			});
		}
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(400).json({
				msg: 'Incorrect password'
			});
		}
		res.json({
			msg: 'Password verified'
		});
	} catch (err) {
		console.error(err);
		res.status(403).json({
			msg: 'Invalid or expired token'
		});
	}
});

app.post('/api/runCode/count', async (req, res) => {
	const {
		username,
		language
	} = req.body;

	try {
		await checkAndConnectDB();

		const user = await User.findOne({
			username
		});
		if (!user) {
			return res.status(404).json({
				msg: 'User not found'
			});
		}

		if (!updateLanguageCount(user, 'runCodeCount', language)) {
			return res.status(400).json({
				msg: 'Unsupported language'
			});
		}

		await user.save();
		res.status(204).send();
	} catch (err) {
		console.error(err);
		res.status(500).json({
			msg: 'Server error'
		});
	}
});

app.post('/api/generateCode/count', async (req, res) => {
	const {
		username,
		language
	} = req.body;

	try {
		await checkAndConnectDB();

		const user = await User.findOne({
			username
		});
		if (!user) {
			return res.status(404).json({
				msg: 'User not found'
			});
		}

		if (!updateLanguageCount(user, 'generateCodeCount', language)) {
			return res.status(400).json({
				msg: 'Unsupported language'
			});
		}

		await user.save();
		res.status(204).send();
	} catch (err) {
		console.error(err);
		res.status(500).json({
			msg: 'Server error'
		});
	}
});

app.post('/api/refactorCode/count', async (req, res) => {
	const {
		username,
		language
	} = req.body;

	try {
		await checkAndConnectDB();

		const user = await User.findOne({
			username
		});
		if (!user) {
			return res.status(404).json({
				msg: 'User not found'
			});
		}

		if (!updateLanguageCount(user, 'refactorCodeCount', language)) {
			return res.status(400).json({
				msg: 'Unsupported language'
			});
		}

		await user.save();
		res.status(204).send();
	} catch (err) {
		console.error(err);
		res.status(500).json({
			msg: 'Server error'
		});
	}
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));