const Log = require('../models/Log.js');

async function logUserAction(user, actionType) {
	try {
		let log = await Log.findOne({
			username: user.username,
			email: user.email,
		});

		if (log) {
			log.lastLogin = user.lastLogin;
			log.createdDate = user.createdDate;
			log.generateCodeCount = user.generateCodeCount;
			log.refactorCodeCount = user.refactorCodeCount;
			log.runCodeCount = user.runCodeCount;
			log.sharedLinks = user.sharedLinks;
			log.actionType = actionType;
		} else {
			log = new Log({
				username: user.username,
				email: user.email,
				lastLogin: user.lastLogin,
				createdDate: user.createdDate,
				generateCodeCount: user.generateCodeCount,
				refactorCodeCount: user.refactorCodeCount,
				runCodeCount: user.runCodeCount,
				sharedLinks: user.sharedLinks,
				actionType: actionType,
			});
		}

		await log.save();
	} catch (err) {
		console.error('Error logging user action:', err);
	}
}

module.exports = { logUserAction };