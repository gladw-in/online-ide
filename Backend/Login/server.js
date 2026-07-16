const express = require('express');
const path = require('node:path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const pino = require('pino');
const pinoHttp = require('pino-http');
const {
	OAuth2Client
} = require('google-auth-library');
const cors = require('cors');
require('dotenv').config();

const REQUIRED_ENV = ['MONGO_URI', 'JWT_SECRET', 'GOOGLE_CLIENT_ID', 'RECAPTCHA_SECRET_KEY',
	'RECAPTCHA_THRESHOLD', 'TURNSTILE_SECRET_KEY', 'OTP_EMAIL_SERVICE', 'OTP_EMAIL_USER',
	'OTP_EMAIL_PASS', 'REDIS_URL', 'REDIS_PASSWORD', 'RATE_LIMIT_REQUESTS',
	'RATE_LIMIT_WINDOW', 'FRONTEND_URL', 'PORT', 'LOG_LEVEL',
	'HIBP_ENABLED', 'HIBP_TIMEOUT', 'HIBP_CACHE_TTL'
];

const missing = REQUIRED_ENV.filter(key => !process.env[key]);
if (missing.length > 0) {
	console.error('FATAL: Missing required environment variables:', missing.join(', '));
	throw new Error(`Missing env vars: ${missing.join(', ')}`);
}

const corsOptions = require('./config/corsOptions');
const User = require('./models/User');
const {
	usernameRegex,
	emailRegex,
	pwdRegex,
	reservedUsernames,
	sanitizeUsername,
	allowedLanguages
} = require("./utils/validation");

const {
	verifyTurnstile
} = require("./middlewares/verifyTurnstile");

const {
	verifyRecaptcha
} = require('./middlewares/verifyRecaptcha');
const {
	rateLimit
} = require('./middlewares/rateLimit');

const {
	checkAndConnectDB
} = require('./config/db');
const {
	generateOtp
} = require('./utils/otpGenerator');
const {
	logUserAction
} = require('./utils/useLogger')
const {
	updateLanguageCount
} = require('./utils/updateLanguageCount');

const {
	sendOtpEmail
} = require('./smtp/sendMail')
const {
	sendDelEmail
} = require('./smtp/delEmail')
const {
	sendPassChangeEmail
} = require('./smtp/passChanged');
const {
	sendUsernameChangeEmail
} = require('./smtp/usernameChanged');

const {
	checkPasswordLeak
} = require('./utils/hibp');

const app = express();

const logger = pino({
	level: process.env.LOG_LEVEL || 'info',
	base: {
		service: 'online-ide-backend'
	}
});

app.use(pinoHttp({
	logger
}));

app.use(
	helmet({
		contentSecurityPolicy: {
			useDefaults: true,
			directives: {
				defaultSrc: ["'self'"],
				frameAncestors: ["'none'"],
				objectSrc: ["'none'"],
				baseUri: ["'self'"]
			}
		},
		frameguard: {
			action: "deny"
		},
		referrerPolicy: {
			policy: "no-referrer"
		}
	})
);

app.use((req, res, next) => {
	res.setHeader("Strict-Transport-Security", "max-age=31536000");
	res.setHeader("X-Content-Type-Options", "nosniff");
	res.setHeader("Permissions-Policy", "geolocation=(), camera=(), microphone=()");
	next();
});

app.set('trust proxy', 1);
app.use(cors(corsOptions));

app.use(express.json({
	limit: '100kb'
}));

const PORT = process.env.PORT || 5000;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'templates/index.html'));
});

app.post('/api/register', rateLimit, verifyTurnstile, verifyRecaptcha, async (req, res) => {
	const username = req.body.username?.trim();
	const email = req.body.email?.trim();
	const password = req.body.password;

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

				await sendOtpEmail(email, otp).catch(err => console.error('Background email failed:', err));

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

		if (reservedUsernames.includes(username.toLowerCase())) {
			return res.status(400).json({
				msg: 'This username is reserved and cannot be used',
			});
		}

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

		if (!pwdRegex.test(password)) {
			return res.status(400).json({
				msg: "Password must be at least 8 characters and contain only ASCII characters."
			});
		}

		const leakResult = await checkPasswordLeak(password);

		if (leakResult.leaked) {
			return res.status(400).json({
				msg: `This password has appeared in ${leakResult.breachCount.toLocaleString()} known data breaches. Please choose a different one.`,
			});
		}

		const otp = generateOtp();

		const salt = await bcrypt.genSalt(10);
		const hashedOtp = await bcrypt.hash(otp, salt);
		const hashedPassword = await bcrypt.hash(password, salt);

		const newUser = new User({
			username,
			email,
			password: hashedPassword,
			otp: hashedOtp,
			otpExpires: Date.now() + 10 * 60 * 1000,
			isEmailVerified: false,
			lastLogin: null,
			createdDate: Date.now(),
		});

		await newUser.save();

		await sendOtpEmail(email, otp).catch(err => console.error('Background email failed:', err));

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

app.post('/api/login', rateLimit, verifyTurnstile, verifyRecaptcha, async (req, res) => {
	const email = req.body.email?.trim();
	const password = req.body.password;

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

	if (!pwdRegex.test(password)) {
		return res.status(400).json({
			msg: "Password must be at least 8 characters and contain only ASCII characters."
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

		if (user.googleId && !user.password) {
			return res.status(403).json({
				msg: "Login with Google"
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

		user.lastLogin = new Date();

		await user.save();

		const token = jwt.sign({
			userId: user._id,
			v: user.tokenVersion
		}, process.env.JWT_SECRET, {
			algorithm: 'HS512',
			expiresIn: '1w'
		});

		res.json({
			token,
			username: user.username,
			isgoogleuser: false,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({
			msg: 'Server error',
		});
	}
});

app.post('/api/auth/google', rateLimit, verifyTurnstile, verifyRecaptcha, async (req, res) => {
	const {
		token
	} = req.body;

	if (!token) {
		return res.status(401).json({
			msg: "Token is required"
		});
	}

	try {
		await checkAndConnectDB();

		const ticket = await client.verifyIdToken({
			idToken: token,
			audience: GOOGLE_CLIENT_ID,
		});

		const payload = ticket.getPayload();
		const {
			email,
			name,
			sub: googleId
		} = payload;

		let user = await User.findOne({
			email
		});

		let finalUsername;

		if (!user) {
			let baseUsername = sanitizeUsername(name);
			finalUsername = baseUsername;
			let tries = 0;

			const {
				randomBytes
			} = require('crypto');
			let saved = false;

			while (!saved && tries < 10) {
				try {
					user = new User({
						username: finalUsername,
						email: email,
						googleId: googleId,
						isEmailVerified: !!googleId,
					});
					await user.save();
					saved = true;
				} catch (err) {
					if (err.code === 11000 && err.keyPattern?.username) {
						finalUsername = `${baseUsername}_${randomBytes(3).toString('hex')}`;
						tries++;
					} else {
						throw err;
					}
				}
			}

			if (!saved) {
				return res.status(500).json({
					message: 'Unable to generate unique username.'
				});
			}
		} else {
			user.lastLogin = new Date();
			if (!user.googleId) {
				user.googleId = googleId;
			}
			await user.save();
		}

		const appToken = jwt.sign({
			userId: user._id,
			v: user.tokenVersion
		}, process.env.JWT_SECRET, {
			algorithm: 'HS512',
			expiresIn: '1w'
		});

		res.status(200).json({
			message: 'Authentication successful!',
			token: appToken,
			username: user.username,
			isgoogleuser: true,
		});
	} catch (err) {
		console.error('Google auth error:', err);
		res.status(401).json({
			message: 'Invalid Google token or authentication failed.'
		});
	}
});

app.post('/api/verify-otp', rateLimit, verifyRecaptcha, async (req, res) => {
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

	if (!pwdRegex.test(password)) {
		return res.status(400).json({
			msg: "Password must be at least 8 characters and contain only ASCII characters."
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

		if (user.googleId && !user.password) {
			return res.status(403).json({
				msg: "Login with Google"
			});
		}

		if (user.isEmailVerified) {
			return res.status(400).json({
				msg: 'Email is already verified',
			});
		}

		if (!user.otp || !user.otpExpires) {
			return res.status(400).json({
				msg: 'No active OTP. Please request a new one.'
			});
		}

		if (user.otpExpires < Date.now()) {
			user.otp = null;
			user.otpExpires = null;
			await user.save();
			return res.status(400).json({
				msg: 'OTP has expired. Please request a new one.'
			});
		}

		const isOtpValid = await bcrypt.compare(otp, user.otp);

		if (!isOtpValid) {
			user.otpAttempts = (user.otpAttempts || 0) + 1;

			if (user.otpAttempts >= 5) {
				user.otp = null;
				user.otpExpires = null;
				user.otpAttempts = 0;

				await user.save();
				return res.status(400).json({
					msg: 'Too many incorrect attempts. OTP invalidated. Please request a new one.',
				});
			}
			await user.save();

			return res.status(400).json({
				msg: 'Invalid OTP',
			});
		}

		const leakResult = await checkPasswordLeak(password);

		if (leakResult.leaked) {
			return res.status(400).json({
				msg: `This password has appeared in ${leakResult.breachCount.toLocaleString()} known data breaches. Please choose a different one.`,
			});
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		user.password = hashedPassword;
		user.isEmailVerified = true;
		user.otp = null;
		user.otpExpires = null;
		user.lastLogin = new Date();
		user.otpAttempts = 0;

		await user.save();

		const token = jwt.sign({
			userId: user._id,
			v: user.tokenVersion
		}, process.env.JWT_SECRET, {
			algorithm: 'HS512',
			expiresIn: '1w'
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

app.post('/api/resend-otp', rateLimit, verifyRecaptcha, async (req, res) => {
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

		if (!user || user.googleId && !user.password) {
			return res.status(200).json({
				msg: 'If that email is registered, an OTP has been sent.'
			});
		}
		if (!forgotPassword && user.isEmailVerified) {
			return res.status(200).json({
				msg: 'If that email is registered, an OTP has been sent.'
			});
		}

		const otp = generateOtp();
		const otpExpires = Date.now() + 10 * 60 * 1000;

		const salt = await bcrypt.genSalt(10);
		const hashedOtp = await bcrypt.hash(otp, salt);

		user.otp = hashedOtp;
		user.otpExpires = otpExpires;
		user.otpAttempts = 0;
		await user.save();

		await sendOtpEmail(user.email, otp).catch(err => console.error('Background email failed:', err));

		res.status(200).json({
			msg: 'If that email is registered, an OTP has been sent.'
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({
			msg: 'Server error',
		});
	}
});

app.delete('/api/wrong-email', rateLimit, verifyRecaptcha, async (req, res) => {
	const {
		email,
		otp
	} = req.body;
	if (!email || !otp) {
		return res.status(400).json({
			msg: 'Email and OTP are required'
		});
	}

	try {
		await checkAndConnectDB();
		const user = await User.findOne({
			email,
			isEmailVerified: false
		});
		if (!user || !user.otp || user.otpExpires < Date.now()) {
			return res.status(400).json({
				msg: 'Invalid request'
			});
		}

		const isValid = await bcrypt.compare(otp, user.otp);
		if (!isValid) {
			return res.status(400).json({
				msg: 'Invalid OTP'
			});
		}

		await User.deleteOne({
			email,
			isEmailVerified: false
		});
		res.status(200).json({
			msg: 'Unverified account deleted successfully'
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({
			msg: 'Server error, please try again later'
		});
	}
});

app.post('/api/check-email-exists', rateLimit, verifyTurnstile, verifyRecaptcha, async (req, res) => {
	const {
		email
	} = req.body;

	if (!email || !emailRegex.test(email)) {
		return res.status(400).json({
			msg: "Valid email is required"
		});
	}

	try {
		await checkAndConnectDB();

		const user = await User.findOne({
			email
		});

		if (!user) {
			return res.status(200).json({
				msg: "Email check completed"
			});
		}

		if (user.googleId && !user.password) {
			return res.status(200).json({
				msg: "Email check completed"
			});
		}

		return res.status(200).json({
			msg: "Email check completed"
		});

	} catch (err) {
		console.error(err);
		return res.status(500).json({
			msg: "Server error"
		});
	}
});

app.post('/api/forgot-password', rateLimit, verifyRecaptcha, async (req, res) => {
	const {
		email
	} = req.body;
	try {
		await checkAndConnectDB();
		const user = await User.findOne({
			email
		});
		if (user && user.isEmailVerified && !(user.googleId && !user.password)) {
			const otp = generateOtp();
			const salt = await bcrypt.genSalt(10);
			const hashedOtp = await bcrypt.hash(otp, salt);
			user.otp = hashedOtp;
			user.otpExpires = Date.now() + 10 * 60 * 1000;
			user.otpAttempts = 0;
			await user.save();

			await sendOtpEmail(user.email, otp).catch(err => console.error('Background email failed:', err));
		}
		res.status(200).json({
			msg: "If that email is registered and verified, an OTP has been sent."
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({
			msg: "Server error"
		});
	}
});

app.post('/api/reset-password', rateLimit, verifyRecaptcha, async (req, res) => {
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

		if (!user || (user.googleId && !user.password)) {
			return res.status(400).json({
				msg: "Invalid request"
			});
		}

		if (!user.otp || !user.otpExpires) {
			return res.status(400).json({
				msg: 'No active OTP. Please request a new one.'
			});
		}

		if (user.otpExpires < Date.now()) {
			user.otp = null;
			user.otpExpires = null;
			await user.save();
			return res.status(400).json({
				msg: 'OTP has expired. Please request a new one.'
			});
		}

		const isOtpValid = await bcrypt.compare(otp, user.otp);
		if (!isOtpValid) {
			user.otpAttempts = (user.otpAttempts || 0) + 1;

			if (user.otpAttempts >= 5) {
				user.otp = null;
				user.otpExpires = null;
				user.otpAttempts = 0;
				await user.save();
				return res.status(400).json({
					msg: 'Too many incorrect attempts. OTP invalidated. Please request a new one.',
				});
			}
			await user.save();

			return res.status(400).json({
				msg: 'Invalid OTP',
			});
		}

		user.otpAttempts = 0;
		await user.save();

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

app.post('/api/update-password', rateLimit, verifyRecaptcha, async (req, res) => {
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

	if (!pwdRegex.test(password)) {
		return res.status(400).json({
			msg: "Password must be at least 8 characters and contain only ASCII characters."
		});
	}

	try {
		await checkAndConnectDB();

		const user = await User.findOne({
			email
		});

		if (!user || (user.googleId && !user.password)) {
			return res.status(400).json({
				msg: "Invalid request"
			});
		}

		if (!user.otp || !user.otpExpires) {
			return res.status(400).json({
				msg: 'No active OTP. Please request a new one.'
			});
		}

		if (user.otpExpires < Date.now()) {
			user.otp = null;
			user.otpExpires = null;
			await user.save();
			return res.status(400).json({
				msg: 'OTP has expired. Please request a new one.'
			});
		}

		const isOtpValid = await bcrypt.compare(otp, user.otp);
		if (!isOtpValid) {
			user.otpAttempts = (user.otpAttempts || 0) + 1;

			if (user.otpAttempts >= 5) {
				user.otp = null;
				user.otpExpires = null;
				user.otpAttempts = 0;
				await user.save();
				return res.status(400).json({
					msg: 'Too many incorrect attempts. OTP invalidated. Please request a new one.',
				});
			}
			await user.save();

			return res.status(400).json({
				msg: 'Invalid OTP',
			});
		}

		const leakResult = await checkPasswordLeak(password);

		if (leakResult.leaked) {
			return res.status(400).json({
				msg: `This password has appeared in ${leakResult.breachCount.toLocaleString()} known data breaches. Please choose a different one.`,
			});
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		user.password = hashedPassword;
		user.otp = null;
		user.otpExpires = null;
		user.otpAttempts = 0;
		user.passwordChangedAt = new Date();
		user.tokenVersion = (user.tokenVersion || 0) + 1;
		await user.save();

		await sendPassChangeEmail(user.email);

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

app.get('/api/protected', rateLimit, async (req, res) => {
	const token = req.headers['authorization']?.split(' ')[1];

	if (!token) {
		return res.status(403).json({
			msg: 'No token provided',
		});
	}

	try {
		await checkAndConnectDB();

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.userId).select('tokenVersion passwordChangedAt username email lastLogin');

		if (!user || decoded.v !== user.tokenVersion) {
			return res.status(403).json({
				msg: 'Session expired. Please log in again.'
			});
		}

		if (user.passwordChangedAt) {
			const changedTimestamp = parseInt(user.passwordChangedAt.getTime() / 1000, 10);
			if (decoded.iat < changedTimestamp) {
				return res.status(403).json({
					msg: 'Session expired due to a recent password change. Please log in again.',
				});
			}
		}

		const fiveMinutes = 5 * 60 * 1000;
		const now = Date.now();

		if (!user.lastLogin || now - user.lastLogin > fiveMinutes) {
			user.lastLogin = now;
			await user.save();
		}

		const response = {
			msg: 'Protected data',
			username: user.username,
		};

		res.json(response);
	} catch (err) {
		res.status(403).json({
			msg: 'Invalid or expired token',
		});
	}
});

app.post('/api/account-details', rateLimit, verifyRecaptcha, async (req, res) => {
	const token = req.headers['authorization']?.split(' ')[1];

	if (!token) {
		return res.status(403).json({
			msg: 'No token provided',
		});
	}

	try {
		await checkAndConnectDB();

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.userId).select('tokenVersion passwordChangedAt username email lastLogin');

		if (!user || decoded.v !== user.tokenVersion) {
			return res.status(403).json({
				msg: 'Session expired. Please log in again.'
			});
		}


		if (user.passwordChangedAt) {
			const changedTimestamp = parseInt(user.passwordChangedAt.getTime() / 1000, 10);
			if (decoded.iat < changedTimestamp) {
				return res.status(403).json({
					msg: 'Session expired due to a recent password change. Please log in again.',
				});
			}
		}

		const fiveMinutes = 5 * 60 * 1000;
		const now = Date.now();

		if (!user.lastLogin || now - user.lastLogin > fiveMinutes) {
			user.lastLogin = now;
			await user.save();
		}

		const response = {
			msg: 'Protected data',
			username: user.username,
			email: user.email,
		};

		res.json(response);
	} catch (err) {
		res.status(403).json({
			msg: 'Invalid or expired token',
		});
	}
});

app.put('/api/change-username', rateLimit, verifyRecaptcha, async (req, res) => {
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

	if (reservedUsernames.includes(newUsername.toLowerCase())) {
		return res.status(400).json({
			msg: 'This username is reserved and cannot be used',
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

		if (!user || decoded.v !== user.tokenVersion) {
			return res.status(403).json({
				msg: 'Session expired. Please log in again.'
			});
		}

		if (user.passwordChangedAt) {
			const changedTimestamp = parseInt(user.passwordChangedAt.getTime() / 1000, 10);
			if (decoded.iat < changedTimestamp) {
				return res.status(403).json({
					msg: 'Session expired due to a recent password change. Please log in again.',
				});
			}
		}

		const existingUser = await User.findOne({
			username: newUsername,
		});

		if (existingUser) {
			return res.status(400).json({
				msg: 'Username is already taken',
			});
		}

		const oldUsername = user.username;

		user.username = newUsername;
		await user.save();

		await sendUsernameChangeEmail(user.email, oldUsername, newUsername)

		res.json({
			msg: 'Username updated successfully',
		});
	} catch (err) {
		console.error('Error updating username:', err);
		res.status(401).json({
			msg: 'Invalid or expired token'
		});
	}
});

app.put('/api/change-password', rateLimit, verifyRecaptcha, async (req, res) => {
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


	if (newPassword.length < 8 || confirmPassword.length < 8) {
		return res.status(400).json({
			msg: 'Password must be at least 8 characters long',
		});
	}

	if (!pwdRegex.test(newPassword) || !pwdRegex.test(confirmPassword)) {
		return res.status(400).json({
			msg: "Password must be at least 8 characters and contain only ASCII characters."
		});
	}

	try {
		await checkAndConnectDB();

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.userId);

		if (!user || decoded.v !== user.tokenVersion) {
			return res.status(403).json({
				msg: 'Session expired. Please log in again.'
			});
		}

		if (user.googleId && !user.password) {
			return res.status(403).json({
				msg: "Login with Google"
			});
		}

		const leakResult = await checkPasswordLeak(newPassword);

		if (leakResult.leaked) {
			return res.status(400).json({
				msg: `This password has appeared in ${leakResult.breachCount.toLocaleString()} known data breaches. Please choose a different one.`,
			});
		}

		const hashedPassword = await bcrypt.hash(newPassword, 10);

		user.password = hashedPassword;
		user.passwordChangedAt = new Date();
		user.tokenVersion = (user.tokenVersion || 0) + 1;
		await user.save();

		await sendPassChangeEmail(user.email)

		const newToken = jwt.sign({
			userId: user._id,
			v: user.tokenVersion
		}, process.env.JWT_SECRET, {
			algorithm: 'HS512',
			expiresIn: '1w'
		});

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

app.delete('/api/account', rateLimit, verifyTurnstile, verifyRecaptcha, async (req, res) => {
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

		if (!user || decoded.v !== user.tokenVersion) {
			return res.status(403).json({
				msg: 'Session expired. Please log in again.'
			});
		}

		if (user.passwordChangedAt) {
			const changedTimestamp = parseInt(user.passwordChangedAt.getTime() / 1000, 10);
			if (decoded.iat < changedTimestamp) {
				return res.status(403).json({
					msg: 'Session expired due to a recent password change. Please log in again.',
				});
			}
		}

		await logUserAction(user, 'delete');

		await User.findByIdAndDelete(decoded.userId);

		await sendDelEmail(user.email);

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

app.post('/api/verify-password', rateLimit, verifyRecaptcha, async (req, res) => {
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

	if (!pwdRegex.test(password)) {
		return res.status(400).json({
			msg: "Password must be at least 8 characters and contain only ASCII characters."
		});
	}

	try {
		await checkAndConnectDB();

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.userId);

		if (!user || decoded.v !== user.tokenVersion) {
			return res.status(403).json({
				msg: 'Session expired. Please log in again.'
			});
		}

		if (user.passwordChangedAt) {
			const changedTimestamp = parseInt(user.passwordChangedAt.getTime() / 1000, 10);
			if (decoded.iat < changedTimestamp) {
				return res.status(403).json({
					msg: 'Session expired due to a recent password change. Please log in again.',
				});
			}
		}

		if (user.googleId && !user.password) {
			return res.status(403).json({
				msg: "Login with Google"
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

app.post('/api/runCode/count', rateLimit, verifyRecaptcha, async (req, res) => {
	const token = req.headers['authorization']?.split(' ')[1];
	if (!token) return res.status(403).json({
		msg: 'No token provided'
	});

	const {
		language
	} = req.body;
	if (!language) return res.status(400).json({
		msg: 'No valid language provided'
	});

	try {
		await checkAndConnectDB();
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.userId);

		if (!user || decoded.v !== user.tokenVersion) {
			return res.status(403).json({
				msg: 'Session expired. Please log in again.'
			});
		}

		if (!allowedLanguages.includes(language)) {
			return res.status(400).json({
				msg: 'Unsupported language'
			});
		}

		if (!updateLanguageCount(user, 'runCodeCount', language)) {
			return res.status(400).json({
				msg: 'Unsupported language'
			});
		}

		await logUserAction(user, 'update');
		await user.save();
		res.status(204).send();
	} catch (err) {
		console.error(err);
		res.status(500).json({
			msg: 'Server error'
		});
	}
});

app.post('/api/generateCode/count', rateLimit, verifyRecaptcha, async (req, res) => {
	const token = req.headers['authorization']?.split(' ')[1];

	if (!token) {
		return res.status(403).json({
			msg: 'No token provided',
		});
	}

	const {
		language
	} = req.body;

	if (!language) {
		return res.status(400).json({
			msg: 'No valid language provided',
		});
	}

	try {
		await checkAndConnectDB();

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.userId);

		if (!user || decoded.v !== user.tokenVersion) {
			return res.status(403).json({
				msg: 'Session expired. Please log in again.'
			});
		}

		if (!allowedLanguages.includes(language)) {
			return res.status(400).json({
				msg: 'Unsupported language'
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

app.post('/api/refactorCode/count', rateLimit, verifyRecaptcha, async (req, res) => {
	const token = req.headers['authorization']?.split(' ')[1];

	if (!token) {
		return res.status(403).json({
			msg: 'No token provided',
		});
	}

	const {
		language
	} = req.body;

	if (!language) {
		return res.status(400).json({
			msg: 'No valid language provided',
		});
	}

	try {
		await checkAndConnectDB();

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.userId);

		if (!user || decoded.v !== user.tokenVersion) {
			return res.status(403).json({
				msg: 'Session expired. Please log in again.'
			});
		}

		if (!allowedLanguages.includes(language)) {
			return res.status(400).json({
				msg: 'Unsupported language'
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

app.post('/api/sharedLink/count', rateLimit, verifyRecaptcha, async (req, res) => {
	const token = req.headers['authorization']?.split(' ')[1];

	if (!token) {
		return res.status(403).json({
			msg: 'No token provided',
		});
	}

	const {
		shareId,
		title,
		expiryTime,
	} = req.body;

	if (!shareId || !title || !expiryTime) {
		return res.status(400).json({
			msg: 'Missing required fields: shareId, title, or expiryTime',
		});
	}

	if (shareId.length > 128) {
		return res.status(400).json({
			msg: 'shareId must be at most 128 characters'
		});
	}
	if (title.length > 200) {
		return res.status(400).json({
			msg: 'Title must be at most 200 characters'
		});
	}

	try {
		await checkAndConnectDB();

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.userId);

		if (!user || decoded.v !== user.tokenVersion) {
			return res.status(403).json({
				msg: 'Session expired. Please log in again.'
			});
		}

		if (user.sharedLinks.length >= 100) {
			return res.status(400).json({
				msg: 'Maximum 100 shared links reached. Delete some to continue.'
			});
		}

		const expiryMilliseconds = parseInt(expiryTime) * 60 * 1000;
		const expiryDate = new Date(Date.now() + expiryMilliseconds);

		const linkExists = user.sharedLinks.some(
			(link) => link.shareId === shareId
		);

		if (!linkExists) {
			await User.updateOne({
				_id: user._id
			}, {
				$push: {
					sharedLinks: {
						shareId,
						title,
						expiryTime: expiryDate
					}
				}
			});

			const freshUser = await User.findById(user._id);
			await logUserAction(freshUser, 'update');
		}

		res.status(204).send();
	} catch (err) {
		console.error(err);
		res.status(500).json({
			msg: 'Server error',
		});
	}
});

app.post('/api/user/sharedLinks', rateLimit, async (req, res) => {
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

		if (!user || decoded.v !== user.tokenVersion) {
			return res.status(403).json({
				msg: 'Session expired. Please log in again.'
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

app.delete('/api/sharedLink', rateLimit, verifyRecaptcha, async (req, res) => {
	const token = req.headers['authorization']?.split(' ')[1];
	if (!token) return res.status(403).json({
		msg: 'No token provided'
	});

	const {
		shareId
	} = req.body;

	try {
		await checkAndConnectDB();
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.userId);

		if (!user || decoded.v !== user.tokenVersion) {
			return res.status(403).json({
				msg: 'Session expired. Please log in again.'
			});
		}

		const linkIndex = user.sharedLinks.findIndex(link => link.shareId === shareId);
		if (linkIndex === -1) return res.status(403).json({
			msg: 'Forbidden'
		});

		user.sharedLinks.splice(linkIndex, 1);
		await user.save();
		res.status(200).json({
			msg: 'Shared link deleted successfully'
		});
	} catch (err) {
		console.error(err);
		if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
			return res.status(403).json({
				msg: 'Invalid or expired token'
			});
		}
		res.status(500).json({
			msg: 'Server error'
		});
	}
});

app.delete('/api/user/sharedLink/:shareId', rateLimit, verifyRecaptcha, async (req, res) => {
	const {
		shareId
	} = req.params;
	const token = req.headers['authorization']?.split(' ')[1];
	if (!token) return res.status(403).json({
		msg: 'No token provided'
	});

	try {
		await checkAndConnectDB();
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.userId);

		if (!user || decoded.v !== user.tokenVersion) {
			return res.status(403).json({
				msg: 'Session expired. Please log in again.'
			});
		}

		const linkIndex = user.sharedLinks.findIndex(link => link.shareId === shareId);
		if (linkIndex === -1) return res.status(403).json({
			msg: 'Forbidden'
		});

		user.sharedLinks.splice(linkIndex, 1);
		await logUserAction(user, 'update');
		await user.save();
		res.status(200).json({
			msg: 'Shared link deleted successfully'
		});
	} catch (err) {
		console.error(err);
		if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
			return res.status(403).json({
				msg: 'Invalid or expired token'
			});
		}
		res.status(500).json({
			msg: 'Server error'
		});
	}
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));