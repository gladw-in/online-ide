// Returns the user's shared links after pruning any that have expired.

const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const {
	checkAndConnectDB
} = require('../../config/db');

async function getSharedLinks(req, res) {
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

		const currentDate = new Date();
		const expiredLinks = user.sharedLinks.filter(
			(link) => new Date(link.expiryTime) <= currentDate
		);
		if (expiredLinks.length > 0) {
			user.sharedLinks = user.sharedLinks.filter(
				(link) => new Date(link.expiryTime) > currentDate
			);
			await user.save();
		}

		const sharedLinksWithoutId = user.sharedLinks.map((link) => {
			const {
				_id,
				...linkWithoutId
			} = link.toObject();
			return linkWithoutId;
		});

		res.status(200).json({
			sharedLinks: sharedLinksWithoutId
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({
			msg: 'Server error'
		});
	}
}

module.exports = {
	getSharedLinks
};