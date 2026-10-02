// Verifies a password-reset OTP so the user can proceed to the next step.

const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const {
	checkAndConnectDB
} = require('../../config/db');

async function resetPassword(req, res) {
	const {
		otp
	} = req.body;
	const email = req.body.email?.trim().toLowerCase();

	if (!otp || typeof otp !== 'string' || otp.trim().length === 0) {
		return res.status(400).json({
			msg: 'OTP is required'
		});
	}

	try {
		await checkAndConnectDB();
		const user = await User.findOne({
			email
		});

		if (!user || (user.googleId && !user.password)) {
			return res.status(400).json({
				msg: 'Invalid request'
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

		user.otpAttempts = 0;
		await user.save();

		res.status(200).json({
			msg: 'OTP verified successfully'
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({
			msg: 'Server error'
		});
	}
}

module.exports = {
	resetPassword
};