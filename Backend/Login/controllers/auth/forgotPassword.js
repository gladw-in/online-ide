// Sends a password-reset OTP to a verified email without leaking account existence.

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

async function forgotPassword(req, res) {
	const email = req.body.email?.trim().toLowerCase();

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

			await sendOtpEmail(user.email, otp).catch((err) =>
				console.error('Background email failed:', err)
			);
		}

		res.status(200).json({
			msg: 'If that email is registered and verified, an OTP has been sent.',
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({
			msg: 'Server error'
		});
	}
}

module.exports = {
	forgotPassword
};