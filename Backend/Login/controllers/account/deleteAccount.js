// Deletes the user's account, logs the action, and sends a confirmation email.

const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const {
	checkAndConnectDB
} = require('../../config/db');
const {
	logUserAction
} = require('../../utils/useLogger');
const {
	sendDelEmail
} = require('../../smtp/delEmail');

async function deleteAccount(req, res) {
	const token = req.headers['authorization']?.split(' ')[1];

	if (!token) {
		return res.status(403).json({
			msg: 'No token provided'
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

		await logUserAction(user, 'delete');
		await User.findByIdAndDelete(decoded.userId);
		await sendDelEmail(user.email);

		res.json({
			msg: 'Account deleted successfully'
		});
	} catch (err) {
		console.error(err);
		res.status(403).json({
			msg: 'Invalid or expired token'
		});
	}
}

module.exports = {
	deleteAccount
};