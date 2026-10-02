// Returns a generic response to prevent revealing whether an email is registered.

const {
	emailRegex
} = require('../../utils/validation');
const {
	checkAndConnectDB
} = require('../../config/db');

async function checkEmailExists(req, res) {
	const email = req.body.email?.trim().toLowerCase();

	if (!email || !emailRegex.test(email)) {
		return res.status(400).json({
			msg: 'Valid email is required'
		});
	}

	try {
		await checkAndConnectDB();

		return res.status(200).json({
			msg: 'Email check completed'
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			msg: 'Server error'
		});
	}
}

module.exports = {
	checkEmailExists
};