// Deletes an unverified account when the user confirms the email was wrong.

const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const {
	checkAndConnectDB
} = require('../../config/db');

async function wrongEmail(req, res) {
	const {
		otp
	} = req.body;
	const email = req.body.email?.trim().toLowerCase();

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
}

module.exports = {
	wrongEmail
};