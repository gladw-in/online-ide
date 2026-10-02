// Checks that the provided password matches the user's stored hash.

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const {
	pwdRegex
} = require('../../utils/validation');
const {
	checkAndConnectDB
} = require('../../config/db');

async function verifyPassword(req, res) {
	const {
		password
	} = req.body;
	const token = req.headers['authorization']?.split(' ')[1];

	if (!token) {
		return res.status(403).json({
			msg: 'No token provided'
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
				msg: 'Login with Google'
			});
		}

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(400).json({
				msg: 'Incorrect password'
			});
		}

		res.json({
			msg: 'Password verified'
		});
	} catch (err) {
		console.error(err);
		res.status(403).json({
			msg: 'Invalid or expired token'
		});
	}
}

module.exports = {
	verifyPassword
};