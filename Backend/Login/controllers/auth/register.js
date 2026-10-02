// Registers a new user, hashes the password, and emails an OTP for verification.

const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const {
	usernameRegex,
	emailRegex,
	pwdRegex,
	reservedUsernames,
} = require('../../utils/validation');
const {
	checkAndConnectDB
} = require('../../config/db');
const {
	generateOtp
} = require('../../utils/otpGenerator');
const {
	sendOtpEmail
} = require('../../smtp/sendMail');
const {
	checkPasswordLeak
} = require('../../utils/hibp');

async function register(req, res) {
	const username = req.body.username?.trim();
	const email = req.body.email?.trim().toLowerCase();
	const password = req.body.password;

	try {
		await checkAndConnectDB();

		const existingEmail = await User.findOne({
			email
		});
		if (existingEmail) {
			if (!existingEmail.isEmailVerified) {
				const otp = generateOtp();
				const salt = await bcrypt.genSalt(10);
				const hashedOtp = await bcrypt.hash(otp, salt);

				existingEmail.otp = hashedOtp;
				existingEmail.otpExpires = Date.now() + 10 * 60 * 1000;
				await existingEmail.save();

				await sendOtpEmail(email, otp).catch((err) =>
					console.error('Background email failed:', err)
				);

				return res.status(200).json({
					msg: 'Email not verified.'
				});
			} else {
				return res.status(400).json({
					msg: 'Email already in use'
				});
			}
		}

		const existingUsername = await User.findOne({
			username
		});
		if (username && reservedUsernames.includes(username.toLowerCase())) {
			return res.status(400).json({
				msg: 'This username is reserved and cannot be used'
			});
		}

		if (existingUsername) {
			return res.status(400).json({
				msg: 'Username already taken'
			});
		}

		if (!username || !usernameRegex.test(username)) {
			return res.status(400).json({
				msg: 'Username can only contain letters, numbers, underscores, hyphens, and periods (5-30 characters).',
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

		if (!password || password.length < 8) {
			return res.status(400).json({
				msg: 'Password must be at least 8 characters long'
			});
		}

		if (!pwdRegex.test(password)) {
			return res.status(400).json({
				msg: 'Password must be at least 8 characters and contain only ASCII characters.',
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
		await sendOtpEmail(email, otp).catch((err) =>
			console.error('Background email failed:', err)
		);

		res.status(200).json({
			msg: 'Registration successful, please check your email for the OTP to verify your email address.',
		});
	} catch (err) {
		if (err.code === 11000) {
			return res.status(400).json({
				msg: 'Username or email already in use'
			});
		}

		console.error(err);
		res.status(500).json({
			msg: 'Server error'
		});
	}
}

module.exports = {
	register
};