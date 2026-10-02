// Builds the three usage counter handlers (run, generate, refactor) from one factory.

const jwt = require('jsonwebtoken');

const User = require('../models/User');
const {
	allowedLanguages
} = require('../utils/validation');
const {
	checkAndConnectDB
} = require('../config/db');
const {
	logUserAction
} = require('../utils/useLogger');
const {
	updateLanguageCount
} = require('../utils/updateLanguageCount');

function makeCounterHandler(countField) {
	return async function handler(req, res) {
		const token = req.headers['authorization']?.split(' ')[1];
		if (!token) {
			return res.status(403).json({
				msg: 'No token provided',
			});
		}

		const {
			language
		} = req.body;

		if (!language) {
			return res.status(400).json({
				msg: 'No valid language provided',
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

			if (!allowedLanguages.includes(language)) {
				return res.status(400).json({
					msg: 'Unsupported language'
				});
			}

			if (!updateLanguageCount(user, countField, language)) {
				return res.status(400).json({
					msg: 'Unsupported language',
				});
			}

			await logUserAction(user, 'update');
			await user.save();

			res.status(204).send();
		} catch (err) {
			console.error(err);
			res.status(500).json({
				msg: 'Server error',
			});
		}
	};
}

const runCodeCount = makeCounterHandler('runCodeCount');
const generateCodeCount = makeCounterHandler('generateCodeCount');
const refactorCodeCount = makeCounterHandler('refactorCodeCount');

module.exports = {
	runCodeCount,
	generateCodeCount,
	refactorCodeCount,
};