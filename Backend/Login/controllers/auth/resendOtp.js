// Sends a fresh OTP to an unverified user (or for password reset flows).

const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const {
	checkAndConnectDB
} = require('../../config/db');
const {
	generateOtp
} = require('../../utils/otpGenerator');
const {
	sendOtpEmail
} = require('../../smtp/sendMail');

async function resendOtp(req, res) {
	const email = req.body.email?.trim().toLowerCase();
	const {
		'forgot-password': forgotPassword
	} = req.query;

	if (!email) {
		return res.status(400).json({
			msg: 'Email is required'
		});
	}

	try {
		await checkAndConnectDB();
		const user = await User.findOne({
			email
		});

		if (!user || (user.googleId && !user.password)) {
			return res.status(200).json({
				msg: 'If that email is registered, an OTP has been sent.',
			});
		}

		if (!forgotPassword && user.isEmailVerified) {
			return res.status(200).json({
				msg: 'If that email is registered, an OTP has been sent.',
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

		await sendOtpEmail(user.email, otp).catch((err) =>
			console.error('Background email failed:', err)
		);

		res.status(200).json({
			msg: 'If that email is registered, an OTP has been sent.',
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({
			msg: 'Server error'
		});
	}
}

module.exports = {
	resendOtp
};