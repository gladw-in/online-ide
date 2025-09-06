const express = require('express');
const path = require('node:path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const corsOptions = require('./config/corsOptions');
const User = require('./models/User');
const {
  usernameRegex,
  emailRegex,
  pwdRegex,
  reservedUsernames,
  sanitizeUsername
} = require("./utils/validation");

const { verifyRecaptcha } = require('./middlewares/verifyRecaptcha');

const { checkAndConnectDB } = require('./config/db');
const { generateOtp } = require('./utils/otpGenerator');
const { logUserAction } = require('./utils/useLogger')
const { cleanExpired } = require('./middlewares/cleanExpired');
const { updateLanguageCount } = require('./utils/updateLanguageCount');

const { sendOtpEmail } = require('./smtp/sendMail')
const { sendDelEmail } = require('./smtp/delEmail')
const { sendPassChangeEmail } = require('./smtp/passChanged');
const { sendUsernameChangeEmail } = require('./smtp/usernameChanged');

const app = express();

app.set('trust proxy', 1);
app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json({limit:'200kb'}));

const PORT = process.env.PORT || 5000;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'templates/index.html'));
});

app.post('/api/register', verifyRecaptcha, cleanExpired, async (req, res) => {
	const username = req.body.username?.trim();
	const email = req.body.email?.trim();
	const password = req.body.password?.trim();

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
			createdDate: null,
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

app.post('/api/login', verifyRecaptcha, cleanExpired, async (req, res) => {
	const email = req.body.email?.trim();
	const password = req.body.password?.trim();

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

		const currentDate = new Date();
		const ISTDate = new Date(currentDate.getTime() + 5.5 * 60 * 60 * 1000);
		user.lastLogin = ISTDate;

		await user.save();

		const token = jwt.sign({
				userId: user._id,
			},
			process.env.JWT_SECRET, {
				algorithm: 'HS512',
				expiresIn: '1w',
			}
		);

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

app.post('/api/auth/google',verifyRecaptcha, async (req, res) => {
  const { token } = req.body;

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
    const { email, name, sub: googleId } = payload;

    let user = await User.findOne({ email: email });

	let finalUsername;

    if (!user) {
		let baseUsername = sanitizeUsername(name);
		finalUsername = baseUsername;
		let tries = 0;

		while (
			await User.exists({
				username: finalUsername
			}) ||
			reservedUsernames.includes(finalUsername)
		) {
			const randomSuffix = Math.random().toString(36).substring(2, 6);
			finalUsername = `${baseUsername}_${randomSuffix}`;
			tries++;
			if (tries > 10) {
				return res.status(500).json({
					message: 'Unable to generate unique username.'
				});
			}
		}

      user = new User({
        username: finalUsername,
        email: email,
        googleId: googleId,
		isEmailVerified: !!googleId,
      });

      await user.save();
    } else {
      user.lastLogin = new Date();

	  if(!user.googleId){
		user.googleId = googleId;
	  }

      await user.save();
    }

	const appToken = jwt.sign({
			userId: user._id,
		},
		process.env.JWT_SECRET, {
			algorithm: 'HS512',
			expiresIn: '1w',
		}
	);
    
    res.status(200).json({
      message: 'Authentication successful!',
      token: appToken,
      username: user.username,
	  isgoogleuser: true,
    });

  } catch (err) {
    res.status(401).json({ message: 'Invalid Google token or authentication failed.' });
  }
});

app.post('/api/verify-otp', verifyRecaptcha, async (req, res) => {
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
		const currentDate = new Date();
		const ISTDate = new Date(currentDate.getTime() + 5.5 * 60 * 60 * 1000);

		user.password = hashedPassword;
		user.isEmailVerified = true;
		user.otp = null;
		user.otpExpires = null;
		user.lastLogin = ISTDate;
		user.createdDate = ISTDate;

		await user.save();

		const token = jwt.sign({
			userId: user._id
		}, process.env.JWT_SECRET, {
			algorithm: 'HS512'
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

app.post('/api/resend-otp', verifyRecaptcha, async (req, res) => {
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

		if (user.googleId && !user.password) {
			return res.status(403).json({
				msg: "Login with Google"
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

app.delete('/api/wrong-email', verifyRecaptcha, async (req, res) => {
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

app.post('/api/check-email-exists', verifyRecaptcha, async (req, res) => {
	const {
		email
	} = req.body;

	if (!email || !emailRegex.test(email)) {
		return res.status(400).json({ msg: "Valid email is required" });
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

		if (user.googleId && !user.password) {
			return res.status(403).json({
				msg: "Login with Google"
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

app.post('/api/forgot-password', verifyRecaptcha, async (req, res) => {
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
		
		if (user.googleId && !user.password) {
			return res.status(403).json({
				msg: "Login with Google"
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

app.post('/api/reset-password', verifyRecaptcha, async (req, res) => {
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

		if (user.googleId && !user.password) {
			return res.status(403).json({
				msg: "Login with Google"
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

app.post('/api/update-password', verifyRecaptcha, async (req, res) => {
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

		if (!user) {
			return res.status(400).json({
				msg: "User not found"
			});
		}

		if (user.googleId && !user.password) {
			return res.status(403).json({
				msg: "Login with Google"
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

app.get('/api/protected', cleanExpired, async (req, res) => {
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

app.put('/api/change-username', verifyRecaptcha, async (req, res) => {
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
			msg: 'Invalid or expired token',
			error: err.message,
		});
	}
});

app.put('/api/change-password', verifyRecaptcha, async (req, res) => {
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

		if (!user) {
			return res.status(404).json({
				msg: 'User not found',
			});
		}

		if (user.googleId && !user.password) {
			return res.status(403).json({
				msg: "Login with Google"
			});
		}

		const hashedPassword = await bcrypt.hash(newPassword, 10);

		user.password = hashedPassword;
		await user.save();

		await sendPassChangeEmail(user.email)

		const newToken = jwt.sign({
				userId: user._id,
			},
			process.env.JWT_SECRET, {
				algorithm: 'HS512',
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

app.delete('/api/account', verifyRecaptcha, async (req, res) => {
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

app.post('/api/verify-password', verifyRecaptcha, async (req, res) => {
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

		if (!user) {
			return res.status(404).json({
				msg: 'User not found',
			});
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

app.post('/api/runCode/count', verifyRecaptcha, async (req, res) => {
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

app.post('/api/generateCode/count', verifyRecaptcha, async (req, res) => {
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

app.post('/api/refactorCode/count', verifyRecaptcha, async (req, res) => {
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

app.post('/api/sharedLink/count', verifyRecaptcha, async (req, res) => {
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

app.post('/api/user/sharedLinks', cleanExpired, async (req, res) => {
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

app.delete('/api/sharedLink', verifyRecaptcha, async (req, res) => {
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

app.delete('/api/user/sharedLink/:shareId', verifyRecaptcha, async (req, res) => {
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