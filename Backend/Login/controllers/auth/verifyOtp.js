// Verifies the user's email OTP, sets the password, and returns a JWT.

const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const {
	pwdRegex
} = require('../../utils/validation');
const {
	checkAndConnectDB
} = require('../../config/db');
const {
	checkPasswordLeak
} = require('../../utils/hibp');
const signToken = require('../../utils/signToken');

async function verifyOtp(req, res) {
	const {
		otp,
		password
	} = req.body;
	const email = req.body.email?.trim().toLowerCase();

	if (!otp || typeof otp !== 'string' || otp.trim().length === 0) {
		return res.status(400).json({
			msg: 'OTP is required'
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

	try {
		await checkAndConnectDB();
		const user = await User.findOne({
			email
		});

		if (!user) {
			return res.status(400).json({
				msg: 'User not found'
			});
		}

		if (user.googleId && !user.password) {
			return res.status(403).json({
				msg: 'Login with Google'
			});
		}

		if (user.isEmailVerified) {
			return res.status(400).json({
				msg: 'Email is already verified'
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
				msg: 'Invalid OTP'
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

		const token = signToken(user);

		res.status(200).json({
			token,
			username: user.username
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({
			msg: 'Server error'
		});
	}
}

module.exports = {
	verifyOtp
};