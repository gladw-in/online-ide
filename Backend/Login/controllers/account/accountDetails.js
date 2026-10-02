// Returns the user's username and email after verifying the JWT.

const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const {
	checkAndConnectDB
} = require('../../config/db');

async function accountDetails(req, res) {
	const token = req.headers['authorization']?.split(' ')[1];
	if (!token) {
		return res.status(403).json({
			msg: 'No token provided'
		});
	}

	try {
		await checkAndConnectDB();
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.userId).select(
			'tokenVersion passwordChangedAt username email lastLogin'
		);

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

		res.json({
			msg: 'Protected data',
			username: user.username,
			email: user.email,
		});
	} catch (err) {
		res.status(403).json({
			msg: 'Invalid or expired token'
		});
	}
}

module.exports = {
	accountDetails
};