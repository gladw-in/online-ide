// Adds a new shared link to the user's profile, enforcing the 100-link limit.

const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const {
	checkAndConnectDB
} = require('../../config/db');
const {
	logUserAction
} = require('../../utils/useLogger');

async function createSharedLink(req, res) {
	const token = req.headers['authorization']?.split(' ')[1];
	if (!token) {
		return res.status(403).json({
			msg: 'No token provided'
		});
	}

	const {
		shareId,
		title,
		expiryTime
	} = req.body;

	if (!shareId || !title || !expiryTime) {
		return res.status(400).json({
			msg: 'Missing required fields: shareId, title, or expiryTime',
		});
	}

	if (typeof shareId !== 'string' || shareId.length > 128) {
		return res.status(400).json({
			msg: 'shareId must be a string of at most 128 characters'
		});
	}

	if (typeof title !== 'string' || title.length > 200) {
		return res.status(400).json({
			msg: 'Title must be a string of at most 200 characters'
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

		const minutes = Number(expiryTime);
		if (!Number.isFinite(minutes) || minutes <= 0) {
			return res.status(400).json({
				msg: 'expiryTime must be a positive number of minutes'
			});
		}
		const expiryDate = new Date(Date.now() + minutes * 60 * 1000);

		const result = await User.updateOne({
			_id: user._id,
			'sharedLinks.shareId': {
				$ne: shareId
			},
			$expr: {
				$lt: [{
					$size: '$sharedLinks'
				}, 100]
			},
		}, {
			$push: {
				sharedLinks: {
					shareId,
					title,
					expiryTime: expiryDate,
				},
			},
		});

		if (result.modifiedCount > 0) {
			const freshUser = await User.findById(user._id);
			await logUserAction(freshUser, 'update');
		} else {
			const freshUser = await User.findById(user._id);
			const linkExists = freshUser.sharedLinks.some((l) => l.shareId === shareId);
			if (!linkExists && freshUser.sharedLinks.length >= 100) {
				return res.status(400).json({
					msg: 'Maximum 100 shared links reached. Delete some to continue.',
				});
			}
		}

		res.status(204).send();
	} catch (err) {
		console.error(err);
		res.status(500).json({
			msg: 'Server error'
		});
	}
}

module.exports = {
	createSharedLink
};