const {checkAndConnectDB} = require('../config/db')

const User = require('../models/User')

async function cleanExpired(req, res, next) {
	try {
		await checkAndConnectDB();

		await User.deleteMany({
			isEmailVerified: false,
			otpExpires: { $lte: new Date() },
		});

		next();
	} catch (err) {
		console.error('Error cleaning up expired users:', err);
		next();
	}
}

module.exports = { cleanExpired };
