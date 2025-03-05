const express = require('express');
const path = require('node:path');
const mongoose = require('mongoose');
const crypto = require('node:crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.set('trust proxy', 1);

const corsOptions = {
	origin: '*',
	methods: ['GET', 'POST', 'PUT', 'DELETE'],
	allowedHeaders: ['Content-Type', 'Authorization'],
	credentials: true,
};

const transporter = nodemailer.createTransport({
	service: process.env.OTP_EMAIL_SERVICE,
	auth: {
		user: process.env.OTP_EMAIL_USER,
		pass: process.env.OTP_EMAIL_PASS,
	},
});

const usernameRegex = /^[a-zA-Z0-9_.-]{5,30}$/;

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
			user[countType].set(
				'HtmlJsCss',
				(user[countType].get('HtmlJsCss') || 0) + 1
			);
			break;
		case 'c':
			user[countType].set('c', (user[countType].get('c') || 0) + 1);
			break;
		case 'cpp':
			user[countType].set('cpp', (user[countType].get('cpp') || 0) + 1);
			break;
		case 'java':
			user[countType].set('java', (user[countType].get('java') || 0) + 1);
			break;
		case 'csharp':
			user[countType].set('cs', (user[countType].get('cs') || 0) + 1);
			break;
		case 'rust':
			user[countType].set('rust', (user[countType].get('rust') || 0) + 1);
			break;
		case 'go':
			user[countType].set('go', (user[countType].get('go') || 0) + 1);
			break;
		case 'verilog':
			user[countType].set('verilog', (user[countType].get('verilog') || 0) + 1);
			break;
		case 'sql':
			user[countType].set('sql', (user[countType].get('sql') || 0) + 1);
			break;
		case 'mongodb':
			user[countType].set('mongodb', (user[countType].get('mongodb') || 0) + 1);
			break;
		case 'swift':
			user[countType].set('swift', (user[countType].get('swift') || 0) + 1);
			break;
		case 'ruby':
			user[countType].set('ruby', (user[countType].get('ruby') || 0) + 1);
			break;
		case 'typescript':
			user[countType].set('ts', (user[countType].get('ts') || 0) + 1);
			break;
		case 'dart':
			user[countType].set('dart', (user[countType].get('dart') || 0) + 1);
			break;
		case 'kotlin':
			user[countType].set('kt', (user[countType].get('kt') || 0) + 1);
			break;
		case 'perl':
			user[countType].set('perl', (user[countType].get('perl') || 0) + 1);
			break;
		case 'scala':
			user[countType].set('scala', (user[countType].get('scala') || 0) + 1);
			break;
		case 'julia':
			user[countType].set('julia', (user[countType].get('julia') || 0) + 1);
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
		unique: true,
		trim: true,
		minlength: 5,
		maxlength: 30,
	},
	email: {
		type: String,
		required: true,
		unique: true,
		lowercase: true,
		match: [/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/, 'Please provide a valid email address'],
	},
	password: {
		type: String,
		required: true,
	},
	lastLogin: {
		type: Date,
		default: null,
	},
	createdDate: {
		type: Date,
		default: Date.now,
	},
	isEmailVerified: {
		type: Boolean,
		default: false,
	},
	otp: {
		type: String,
		default: null,
	},
	otpExpires: {
		type: Date,
		default: null,
	},
	generateCodeCount: {
		type: Map,
		of: Number,
		default: () => ({
			py: 0,
			js: 0,
			HtmlJsCss: 0,
			c: 0,
			cpp: 0,
			java: 0,
			cs: 0,
			rust: 0,
			go: 0,
			sql: 0,
			mongodb: 0,
			swift: 0,
			ruby: 0,
			ts: 0,
			dart: 0,
			kt: 0,
			perl: 0,
			scala: 0,
			julia: 0,
			verilog: 0,
		}),
	},
	refactorCodeCount: {
		type: Map,
		of: Number,
		default: () => ({
			py: 0,
			js: 0,
			HtmlJsCss: 0,
			c: 0,
			cpp: 0,
			java: 0,
			cs: 0,
			rust: 0,
			go: 0,
			sql: 0,
			mongodb: 0,
			swift: 0,
			ruby: 0,
			ts: 0,
			dart: 0,
			kt: 0,
			perl: 0,
			scala: 0,
			julia: 0,
			verilog: 0,
		}),
	},
	runCodeCount: {
		type: Map,
		of: Number,
		default: () => ({
			py: 0,
			js: 0,
			c: 0,
			cpp: 0,
			java: 0,
			cs: 0,
			rust: 0,
			go: 0,
			sql: 0,
			mongodb: 0,
			swift: 0,
			ruby: 0,
			ts: 0,
			dart: 0,
			kt: 0,
			perl: 0,
			scala: 0,
			julia: 0,
			verilog: 0,
		}),
	},
	sharedLinks: {
		type: [{
			shareId: {
				type: String,
				required: true,
				unique: true,
			},
			title: {
				type: String,
				required: true,
			},
			expiryTime: {
				type: Date,
				required: true,
			},
		}, ],
		default: [],
	},
});

const logsSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	lastLogin: {
		type: Date,
		default: null,
	},
	createdDate: {
		type: Date,
		default: Date.now,
	},
	generateCodeCount: {
		type: Map,
		of: Number,
		default: {},
	},
	refactorCodeCount: {
		type: Map,
		of: Number,
		default: {},
	},
	runCodeCount: {
		type: Map,
		of: Number,
		default: {},
	},
	sharedLinks: {
		type: Object,
		default: {},
	},
	actionType: {
		type: String,
		required: true,
	},
	timestamp: {
		type: Date,
		default: Date.now,
	},
});

const User = mongoose.model('user', userSchema);

const Log = mongoose.model('log', logsSchema);

async function checkAndConnectDB() {
	if (mongoose.connection.readyState === 0) {
		try {
			await mongoose
				.connect(MONGO_URI)
				.then(() => console.log('MongoDB connected'))
				.catch((err) => console.log('Error connecting to MongoDB:', err));
			console.log('MongoDB connected');
		} catch (err) {
			console.error('Error connecting to MongoDB:', err);
			throw new Error('Database connection failed');
		}
	}
}

async function logUserAction(user, actionType) {
	try {
		let log = await Log.findOne({
			username: user.username,
			email: user.email,
		});

		if (log) {
			log.lastLogin = user.lastLogin;
			log.createdDate = user.createdDate;
			log.generateCodeCount = user.generateCodeCount;
			log.refactorCodeCount = user.refactorCodeCount;
			log.runCodeCount = user.runCodeCount;
			log.sharedLinks = user.sharedLinks;
			log.actionType = actionType;
		} else {
			log = new Log({
				username: user.username,
				email: user.email,
				lastLogin: user.lastLogin,
				createdDate: user.createdDate,
				generateCodeCount: user.generateCodeCount,
				refactorCodeCount: user.refactorCodeCount,
				runCodeCount: user.runCodeCount,
				sharedLinks: user.sharedLinks,
				actionType: actionType,
			});
		}

		await log.save();
	} catch (err) {
		console.error('Error logging user action:', err);
	}
}

function generateOtp() {
	return crypto.randomBytes(3).toString('hex');
}

async function sendOtpEmail(email, otp) {
	const mailOptions = {
		from: process.env.OTP_EMAIL_USER,
		to: email,
		subject: 'Online IDE - Your OTP for Email Verification',
		html: `
            <html>
                <body>
                    <h2>Welcome to Our Online IDE!</h2>
                    <p>We received a request to verify your email address.</p>
                    <p>To complete your email verification, please use the OTP below:</p>
                    <h3 style="color: #4CAF50;">Your OTP: <strong>${otp}</strong></h3>
                    <p><i>This OTP will expire in 10 minutes. If you did not request this, please ignore this email.</i></p>
                    <p><a href="https://online-ide-cyan.vercel.app/" target="_blank" style="color: #007BFF;">Online IDE</a></p>
                    <p>Thank you for choosing our service!</p>
                </body>
            </html>
        `,
	};

	try {
		await transporter.sendMail(mailOptions);
	} catch (error) {
		throw new Error('Failed to send OTP email');
	}
}

userSchema.pre('save', function(next) {
	const user = this;
	const actionType = user.isNew ? 'create' : 'update';
	logUserAction(user, actionType);
	next();
});

userSchema.pre('remove', function(next) {
	const user = this;
	logUserAction(user, 'delete');
	next();
});

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/register', async (req, res) => {
	const {
		username,
		email,
		password
	} = req.body;

	try {
		await checkAndConnectDB();

		const existingEmail = await User.findOne({
			email,
		});

		if (existingEmail) {
			if (!existingEmail.isEmailVerified) {
				const otp = generateOtp();

				const salt = await bcrypt.genSalt(10);
				const hashedOtp = await bcrypt.hash(otp, salt);

				existingEmail.otp = hashedOtp;
				existingEmail.otpExpires = Date.now() + 10 * 60 * 1000;
				await existingEmail.save();

				await sendOtpEmail(email, otp);

				return res.status(200).json({
					msg: 'Email not verified.',
				});
			} else {
				return res.status(400).json({
					msg: 'Email already in use',
				});
			}
		}

		const existingUsername = await User.findOne({
			username,
		});

		if (existingUsername) {
			return res.status(400).json({
				msg: 'Username already taken',
			});
		}

		if (!usernameRegex.test(username)) {
			return res.status(400).json({
				msg: 'Username can only contain letters, numbers, underscores, hyphens, and periods (5-30 characters).',
			});
		}

		if (username.length < 5 || username.length > 30) {
			return res.status(400).json({
				msg: 'Username should be between 5 and 30 characters',
			});
		}

		if (!emailRegex.test(email)) {
			return res.status(400).json({
				msg: 'Invalid email format',
			});
		}

		if (password.length < 8) {
			return res.status(400).json({
				msg: 'Password must be at least 8 characters long',
			});
		}

		const otp = generateOtp();

		const salt = await bcrypt.genSalt(10);
		const hashedOtp = await bcrypt.hash(otp, salt);
		const hashedPassword = await bcrypt.hash(password, salt);
		const currentDate = new Date();
		const ISTDate = new Date(currentDate.getTime() + 5.5 * 60 * 60 * 1000);

		const newUser = new User({
			username,
			email,
			password: hashedPassword,
			otp: hashedOtp,
			otpExpires: Date.now() + 10 * 60 * 1000,
			isEmailVerified: false,
			lastLogin: ISTDate,
			createdDate: ISTDate,
		});

		await newUser.save();

		await sendOtpEmail(email, otp);

		res.status(200).json({
			msg: 'Registration successful, please check your email for the OTP to verify your email address.',
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({
			msg: 'Server error',
		});
	}
});

app.post('/api/login', async (req, res) => {
	const {
		email,
		password
	} = req.body;

	if (!emailRegex.test(email)) {
		return res.status(400).json({
			msg: 'Invalid email format',
		});
	}

	if (password.length < 8) {
		return res.status(400).json({
			msg: 'Password must be at least 8 characters long',
		});
	}

	try {
		await checkAndConnectDB();

		const user = await User.findOne({
			email,
		});

		if (!user) {
			return res.status(400).json({
				msg: 'Invalid credentials',
			});
		}

		if (!user.isEmailVerified) {
			return res.status(400).json({
				msg: 'Email not verified',
			});
		}

		const isMatch = await bcrypt.compare(password, user.password);

		if (!isMatch) {
			return res.status(400).json({
				msg: 'Invalid credentials',
			});
		}

		const currentDate = new Date();
		const ISTDate = new Date(currentDate.getTime() + 5.5 * 60 * 60 * 1000);
		user.lastLogin = ISTDate;

		await user.save();

		const token = jwt.sign({
				userId: user._id,
			},
			process.env.JWT_SECRET, {
				algorithm: 'HS256',
			}
		);

		res.json({
			token,
			username: user.username,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({
			msg: 'Server error',
		});
	}
});

app.post('/api/verify-otp', async (req, res) => {
	const {
		email,
		otp,
		password
	} = req.body;

	if (!otp || otp.length === 0) {
		return res.status(400).json({
			msg: 'OTP is required',
		});
	}

	if (password.length < 8) {
		return res.status(400).json({
			msg: 'Password must be at least 8 characters long',
		});
	}

	try {
		await checkAndConnectDB();

		const user = await User.findOne({
			email
		});

		if (!user) {
			return res.status(400).json({
				msg: 'User not found',
			});
		}

		if (user.isEmailVerified) {
			return res.status(400).json({
				msg: 'Email is already verified',
			});
		}

		const isOtpValid = await bcrypt.compare(otp, user.otp);

		if (!isOtpValid) {
			return res.status(400).json({
				msg: 'Invalid OTP',
			});
		}

		if (user.otpExpires < Date.now()) {
			return res.status(400).json({
				msg: 'OTP has expired',
			});
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		user.password = hashedPassword;
		user.isEmailVerified = true;
		user.otp = null;
		user.otpExpires = null;

		await user.save();

		const token = jwt.sign({
			userId: user._id
		}, process.env.JWT_SECRET, {
			algorithm: 'HS256'
		});

		res.status(200).json({
			token,
			username: user.username,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({
			msg: 'Server error',
		});
	}
});

app.post('/api/resend-otp', async (req, res) => {
	const {
		email
	} = req.body;

	const {
		'forgot-password': forgotPassword
	} = req.query;

	if (!email) {
		return res.status(400).json({
			msg: 'Email is required',
		});
	}

	try {
		await checkAndConnectDB();

		const user = await User.findOne({
			email
		});

		if (!user) {
			return res.status(400).json({
				msg: 'User not found',
			});
		}

		if (!forgotPassword) {
			if (user.isEmailVerified) {
				return res.status(400).json({
					msg: 'Email is already verified',
				});
			}
		}

		const otp = generateOtp();
		const otpExpires = Date.now() + 10 * 60 * 1000;

		const salt = await bcrypt.genSalt(10);
		const hashedOtp = await bcrypt.hash(otp, salt);

		user.otp = hashedOtp;
		user.otpExpires = otpExpires;
		await user.save();

		await sendOtpEmail(user.email, otp);

		res.status(200).json({
			msg: 'OTP resent successfully',
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({
			msg: 'Server error',
		});
	}
});

app.delete('/api/wrong-email', async (req, res) => {
	const {
		email
	} = req.body;

	if (!email) {
		return res.status(400).json({
			msg: 'Email is required',
		});
	}

	try {
		await checkAndConnectDB();

		const user = await User.findOne({
			email
		});

		if (!user) {
			return res.status(400).json({
				msg: 'User not found',
			});
		}

		if (user.isEmailVerified) {
			return res.status(400).json({
				msg: 'Email is already verified',
			});
		}

		await User.deleteOne({
			email
		});

		res.status(200).json({
			msg: 'Unverified account deleted successfully',
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({
			msg: 'Server error, please try again later',
		});
	}
});

app.post('/api/check-email-exists', async (req, res) => {
	const {
		email
	} = req.body;

	try {
		await checkAndConnectDB();

		const user = await User.findOne({
			email
		});
		if (!user) {
			return res.status(400).json({
				msg: "User not found"
			});
		}

		res.status(200).json({
			msg: "Email exists"
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({
			msg: "Server error"
		});
	}
});

app.post('/api/forgot-password', async (req, res) => {
	const {
		email
	} = req.body;

	try {
		await checkAndConnectDB();

		const user = await User.findOne({
			email
		});
		if (!user) {
			return res.status(400).json({
				msg: "User not found"
			});
		}

		if (user.isEmailVerified) {
			const otp = generateOtp();
			const salt = await bcrypt.genSalt(10);
			const hashedOtp = await bcrypt.hash(otp, salt);

			user.otp = hashedOtp;
			user.otpExpires = Date.now() + 10 * 60 * 1000;
			await user.save();

			await sendOtpEmail(user.email, otp);

			return res.status(200).json({
				msg: "OTP sent to your email"
			});
		} else {
			return res.status(400).json({
				msg: "Email not verified"
			});
		}
	} catch (err) {
		console.error(err);
		res.status(500).json({
			msg: "Server error"
		});
	}
});

app.post('/api/reset-password', async (req, res) => {
	const {
		email,
		otp
	} = req.body;

	if (!otp || typeof otp !== 'string' || otp.trim().length === 0) {
		return res.status(400).json({
			msg: 'OTP is required',
		});
	}

	try {
		await checkAndConnectDB();

		const user = await User.findOne({
			email
		});
		if (!user) {
			return res.status(400).json({
				msg: "User not found"
			});
		}

		const isOtpValid = await bcrypt.compare(otp, user.otp);
		if (!isOtpValid) {
			return res.status(400).json({
				msg: "Invalid OTP"
			});
		}

		if (user.otpExpires < Date.now()) {
			return res.status(400).json({
				msg: "OTP has expired"
			});
		}

		res.status(200).json({
			msg: "OTP verified successfully"
		});

	} catch (err) {
		console.error(err);
		res.status(500).json({
			msg: "Server error"
		});
	}
});

app.post('/api/update-password', async (req, res) => {
	const {
		email,
		otp,
		password
	} = req.body;

	if (!otp || typeof otp !== 'string' || otp.trim().length === 0) {
		return res.status(400).json({
			msg: 'OTP is required',
		});
	}

	if (password.length < 8) {
		return res.status(400).json({
			msg: 'Password must be at least 8 characters long',
		});
	}

	try {
		await checkAndConnectDB();

		const user = await User.findOne({
			email
		});
		if (!user) {
			return res.status(400).json({
				msg: "User not found"
			});
		}

		const isOtpValid = await bcrypt.compare(otp, user.otp);
		if (!isOtpValid) {
			return res.status(400).json({
				msg: "Invalid OTP"
			});
		}

		if (user.otpExpires < Date.now()) {
			return res.status(400).json({
				msg: "OTP has expired"
			});
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		user.password = hashedPassword;
		user.otp = null;
		user.otpExpires = null;
		await user.save();

		res.status(200).json({
			msg: "Password updated successfully"
		});

	} catch (err) {
		console.error(err);
		res.status(500).json({
			msg: "Server error"
		});
	}
});

app.get('/api/protected', async (req, res) => {
	const token = req.headers['authorization']?.split(' ')[1];

	if (!token) {
		return res.status(403).json({
			msg: 'No token provided',
		});
	}

	try {
		await checkAndConnectDB();

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.userId).select('-password');

		if (!user) {
			return res.status(404).json({
				msg: 'User not found',
			});
		}

		const fiveMinutes = 5 * 60 * 1000;
		const now = Date.now();

		if (!user.lastLogin || now - user.lastLogin > fiveMinutes) {
			user.lastLogin = now;
			await user.save();
		}

		const includeEmail = req.query.email === 'true';
		const response = {
			msg: 'Protected data',
			username: user.username,
		};

		if (includeEmail) {
			response.email = user.email;
		}

		res.json(response);
	} catch (err) {
		res.status(403).json({
			msg: 'Invalid or expired token',
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
			msg: 'No token provided',
		});
	}

	if (!newUsername) {
		return res.status(400).json({
			msg: 'New username is required',
		});
	}

	if (!usernameRegex.test(newUsername)) {
		return res.status(400).json({
			msg: 'Username can only contain letters, numbers, underscores, hyphens, and periods (5-30 characters).',
		});
	}

	if (newUsername.length < 5 || newUsername.length > 30) {
		return res.status(400).json({
			msg: 'Username should be between 5 and 30 characters',
		});
	}

	try {
		await checkAndConnectDB();

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.userId);

		if (!user) {
			return res.status(404).json({
				msg: 'User not found',
			});
		}

		const existingUser = await User.findOne({
			username: newUsername,
		});

		if (existingUser) {
			return res.status(400).json({
				msg: 'Username is already taken',
			});
		}

		user.username = newUsername;
		await user.save();

		res.json({
			msg: 'Username updated successfully',
		});
	} catch (err) {
		console.error('Error updating username:', err);
		res.status(401).json({
			msg: 'Invalid or expired token',
			error: err.message,
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
			msg: 'No token provided',
		});
	}

	if (!newEmail) {
		return res.status(400).json({
			msg: 'New email is required',
		});
	}

	if (!emailRegex.test(newEmail)) {
		return res.status(400).json({
			msg: 'Invalid email format',
		});
	}

	try {
		await checkAndConnectDB();

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.userId);

		if (!user) {
			return res.status(404).json({
				msg: 'User not found',
			});
		}

		const existingUser = await User.findOne({
			email: newEmail,
		});

		if (existingUser) {
			return res.status(400).json({
				msg: 'Email is already taken',
			});
		}

		user.email = newEmail;
		await user.save();

		res.json({
			msg: 'Email updated successfully',
		});
	} catch (err) {
		console.error('Error updating email:', err);
		res.status(401).json({
			msg: 'Invalid or expired token',
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
			msg: 'No token provided',
		});
	}

	if (!newPassword || !confirmPassword) {
		return res.status(400).json({
			msg: 'New password and confirm password are required',
		});
	}

	if (newPassword !== confirmPassword) {
		return res.status(400).json({
			msg: 'New password and confirm password do not match',
		});
	}

	if (newPassword.length < 8) {
		return res.status(400).json({
			msg: 'Password must be at least 8 characters long',
		});
	}

	try {
		await checkAndConnectDB();

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.userId);

		if (!user) {
			return res.status(404).json({
				msg: 'User not found',
			});
		}

		const hashedPassword = await bcrypt.hash(newPassword, 10);

		user.password = hashedPassword;
		await user.save();

		const newToken = jwt.sign({
				userId: user._id,
			},
			process.env.JWT_SECRET, {
				algorithm: 'HS256',
			}
		);

		res.json({
			msg: 'Password updated successfully',
			token: newToken,
			username: user.username,
		});
	} catch (err) {
		console.error('Error updating password:', err);
		res.status(401).json({
			msg: 'Invalid or expired token',
		});
	}
});

app.delete('/api/account', async (req, res) => {
	const token = req.headers['authorization']?.split(' ')[1];

	if (!token) {
		return res.status(403).json({
			msg: 'No token provided',
		});
	}

	try {
		await checkAndConnectDB();

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.userId);

		if (!user) {
			return res.status(404).json({
				msg: 'User not found',
			});
		}

		await logUserAction(user, 'delete');

		await User.findByIdAndDelete(decoded.userId);

		res.json({
			msg: 'Account deleted successfully',
		});
	} catch (err) {
		console.error(err);
		res.status(403).json({
			msg: 'Invalid or expired token',
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
			msg: 'No token provided',
		});
	}

	if (password.length < 8) {
		return res.status(400).json({
			msg: 'Password must be at least 8 characters long',
		});
	}

	try {
		await checkAndConnectDB();

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.userId);

		if (!user) {
			return res.status(404).json({
				msg: 'User not found',
			});
		}

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(400).json({
				msg: 'Incorrect password',
			});
		}

		res.json({
			msg: 'Password verified',
		});
	} catch (err) {
		console.error(err);
		res.status(403).json({
			msg: 'Invalid or expired token',
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
			username,
		});

		if (!user) {
			return res.status(404).json({
				msg: 'User not found',
			});
		}

		if (!updateLanguageCount(user, 'runCodeCount', language)) {
			return res.status(400).json({
				msg: 'Unsupported language',
			});
		}

		await logUserAction(user, 'update');
		await user.save();

		res.status(204).send();
	} catch (err) {
		console.error(err);
		res.status(500).json({
			msg: 'Server error',
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
			username,
		});

		if (!user) {
			return res.status(404).json({
				msg: 'User not found',
			});
		}

		if (!updateLanguageCount(user, 'generateCodeCount', language)) {
			return res.status(400).json({
				msg: 'Unsupported language',
			});
		}

		await logUserAction(user, 'update');
		await user.save();

		res.status(204).send();
	} catch (err) {
		console.error(err);
		res.status(500).json({
			msg: 'Server error',
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
			username,
		});

		if (!user) {
			return res.status(404).json({
				msg: 'User not found',
			});
		}

		if (!updateLanguageCount(user, 'refactorCodeCount', language)) {
			return res.status(400).json({
				msg: 'Unsupported language',
			});
		}

		await logUserAction(user, 'update');
		await user.save();

		res.status(204).send();
	} catch (err) {
		console.error(err);
		res.status(500).json({
			msg: 'Server error',
		});
	}
});

app.post('/api/sharedLink/count', async (req, res) => {
	const {
		username,
		shareId,
		title,
		expiryTime,
	} = req.body;

	if (!username || !shareId || !title) {
		return res.status(400).json({
			msg: 'Missing required fields: username, shareId, or title',
		});
	}

	try {
		await checkAndConnectDB();

		const user = await User.findOne({
			username,
		});

		if (!user) {
			return res.status(404).json({
				msg: 'User not found',
			});
		}

		const expiryMilliseconds = parseInt(expiryTime) * 60 * 1000;
		const expiryDate = new Date(Date.now() + expiryMilliseconds);

		const linkExists = user.sharedLinks.some(
			(link) => link.shareId === shareId
		);

		if (!linkExists) {
			user.sharedLinks.push({
				shareId,
				title,
				expiryTime: expiryDate,
			});

			await logUserAction(user, 'update');
			await user.save();
		}

		res.status(204).send();
	} catch (err) {
		console.error(err);
		res.status(500).json({
			msg: 'Server error',
		});
	}
});

app.post('/api/user/sharedLinks', async (req, res) => {
	const token = req.headers['authorization']?.split(' ')[1];

	if (!token) {
		return res.status(403).json({
			msg: 'No token provided',
		});
	}

	try {
		await checkAndConnectDB();

		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		const user = await User.findById(decoded.userId);

		if (!user) {
			return res.status(404).json({
				msg: 'User not found',
			});
		}

		const currentDate = new Date();
		const expiredLinks = user.sharedLinks.filter((link) => new Date(link.expiryTime) <= currentDate);

		if (expiredLinks.length > 0) {
			user.sharedLinks = user.sharedLinks.filter((link) => new Date(link.expiryTime) > currentDate);
			await user.save();
		}

		const sharedLinksWithoutId = user.sharedLinks.map((link) => {
			const {
				_id,
				...linkWithoutId
			} = link.toObject();
			return linkWithoutId;
		});

		res.status(200).json({
			sharedLinks: sharedLinksWithoutId,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({
			msg: 'Server error',
		});
	}
});


app.delete('/api/sharedLink', async (req, res) => {
	const {
		shareId
	} = req.body;

	if (!shareId) {
		return res.status(400).json({
			msg: 'ShareId is required',
		});
	}

	try {
		await checkAndConnectDB();

		const user = await User.findOne({
			'sharedLinks.shareId': shareId,
		});

		if (!user) {
			return res.status(404).json({
				msg: 'Shared link not found',
			});
		}

		const linkIndex = user.sharedLinks.findIndex(
			(link) => link.shareId === shareId
		);

		if (linkIndex === -1) {
			return res.status(404).json({
				msg: 'Shared link not found',
			});
		}

		user.sharedLinks.splice(linkIndex, 1);

		await logUserAction(user, 'update');

		await user.save();

		return res.status(200).json({
			msg: 'Shared link deleted successfully',
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			msg: 'Server error',
		});
	}
});

app.delete('/api/user/sharedLink/:shareId', async (req, res) => {
	const {
		shareId
	} = req.params;
	const token = req.headers['authorization']?.split(' ')[1];

	try {
		await checkAndConnectDB();

		let user;

		if (token) {
			const decoded = jwt.verify(token, process.env.JWT_SECRET);
			user = await User.findById(decoded.userId);
		} else {
			user = await User.findOne({
				'sharedLinks.shareId': shareId,
			});
		}

		if (!user) {
			return res.status(404).json({
				msg: 'User or Shared link not found',
			});
		}

		const linkIndex = user.sharedLinks.findIndex(link => link.shareId === shareId);
		if (linkIndex === -1) {
			return res.status(404).json({
				msg: 'Shared link not found',
			});
		}

		user.sharedLinks.splice(linkIndex, 1);
		await logUserAction(user, 'update');
		await user.save();

		res.status(200).json({
			msg: 'Shared link deleted successfully',
		});
	} catch (err) {
		console.error(err);

		if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
			return res.status(403).json({
				msg: 'Invalid or expired token',
			});
		}

		res.status(500).json({
			msg: 'Server error',
		});
	}
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));