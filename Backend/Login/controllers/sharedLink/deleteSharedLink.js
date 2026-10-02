// Deletes a shared link by ID sent in the request body.

const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const {
	checkAndConnectDB
} = require('../../config/db');
const {
	logUserAction
} = require('../../utils/useLogger');

async function deleteSharedLink(req, res) {
	const token = req.headers['authorization']?.split(' ')[1];
	if (!token) {
		return res.status(403).json({
			msg: 'No token provided'
		});
	}

	const {
		shareId
	} = req.body;

	try {
		await checkAndConnectDB();
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.userId);

		if (!user || decoded.v !== user.tokenVersion) {
			return res.status(403).json({
				msg: 'Session expired. Please log in again.'
			});
		}

		const linkIndex = user.sharedLinks.findIndex((link) => link.shareId === shareId);
		if (linkIndex === -1) {
			return res.status(403).json({
				msg: 'Forbidden'
			});
		}

		user.sharedLinks.splice(linkIndex, 1);
		await logUserAction(user, 'update');
		await user.save();
		res.status(200).json({
			msg: 'Shared link deleted successfully'
		});
	} catch (err) {
		console.error(err);
		if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
			return res.status(403).json({
				msg: 'Invalid or expired token'
			});
		}

		res.status(500).json({
			msg: 'Server error'
		});
	}
}

module.exports = {
	deleteSharedLink
};