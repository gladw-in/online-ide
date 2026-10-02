// Validates a new password, rejects leaked ones, and returns a fresh JWT.

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const {
	pwdRegex
} = require('../../utils/validation');
const {
	checkAndConnectDB
} = require('../../config/db');
const {
	sendPassChangeEmail
} = require('../../smtp/passChanged');
const {
	checkPasswordLeak
} = require('../../utils/hibp');
const signToken = require('../../utils/signToken');

async function changePassword(req, res) {
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

	if (newPassword.length < 8 || confirmPassword.length < 8) {
		return res.status(400).json({
			msg: 'Password must be at least 8 characters long'
		});
	}

	if (!pwdRegex.test(newPassword) || !pwdRegex.test(confirmPassword)) {
		return res.status(400).json({
			msg: 'Password must be at least 8 characters and contain only ASCII characters.',
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
				msg: 'Login with Google'
			});
		}

		const leakResult = await checkPasswordLeak(newPassword);
		if (leakResult.leaked) {
			return res.status(400).json({
				msg: `This password has appeared in ${leakResult.breachCount.toLocaleString()} known data breaches. Please choose a different one.`,
			});
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(newPassword, salt);
		user.password = hashedPassword;
		user.passwordChangedAt = new Date();
		user.tokenVersion = (user.tokenVersion || 0) + 1;
		await user.save();

		await sendPassChangeEmail(user.email);

		const newToken = signToken(user);

		res.json({
			msg: 'Password updated successfully',
			token: newToken,
			username: user.username,
		});
	} catch (err) {
		console.error('Error updating password:', err);
		res.status(401).json({
			msg: 'Invalid or expired token'
		});
	}
}

module.exports = {
	changePassword
};