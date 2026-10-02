// Validates and updates the user's username, then sends a change notification email.

const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const {
	usernameRegex,
	reservedUsernames
} = require('../../utils/validation');
const {
	checkAndConnectDB
} = require('../../config/db');
const {
	sendUsernameChangeEmail
} = require('../../smtp/usernameChanged');

async function changeUsername(req, res) {
	const {
		newUsername
	} = req.body;
	const token = req.headers['authorization']?.split(' ')[1];

	if (!token) {
		return res.status(403).json({
			msg: 'No token provided'
		});
	}

	if (!newUsername) {
		return res.status(400).json({
			msg: 'New username is required'
		});
	}

	if (reservedUsernames.includes(newUsername.toLowerCase())) {
		return res.status(400).json({
			msg: 'This username is reserved and cannot be used'
		});
	}

	if (!usernameRegex.test(newUsername)) {
		return res.status(400).json({
			msg: 'Username can only contain letters, numbers, underscores, hyphens, and periods (5-30 characters).',
		});
	}

	if (newUsername.length < 5 || newUsername.length > 30) {
		return res.status(400).json({
			msg: 'Username should be between 5 and 30 characters'
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

		const existingUser = await User.findOne({
			username: newUsername
		});
		if (existingUser) {
			return res.status(400).json({
				msg: 'Username is already taken'
			});
		}

		const oldUsername = user.username;
		user.username = newUsername;
		await user.save();

		await sendUsernameChangeEmail(user.email, oldUsername, newUsername);

		res.json({
			msg: 'Username updated successfully'
		});
	} catch (err) {
		if (err.code === 11000) {
			return res.status(400).json({
				msg: 'Username is already taken'
			});
		}

		console.error('Error updating username:', err);
		res.status(401).json({
			msg: 'Invalid or expired token'
		});
	}
}

module.exports = {
	changeUsername
};