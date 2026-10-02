// Authenticates a verified user and returns a signed JWT.

const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const {
	emailRegex,
	pwdRegex
} = require('../../utils/validation');
const {
	checkAndConnectDB
} = require('../../config/db');
const signToken = require('../../utils/signToken');

async function login(req, res) {
	const email = req.body.email?.trim().toLowerCase();
	const password = req.body.password;

	if (!emailRegex.test(email)) {
		return res.status(400).json({
			msg: 'Invalid email format'
		});
	}

	if (!password || password.length < 8) {
		return res.status(400).json({
			msg: 'Password must be at least 8 characters long'
		});
	}

	if (!pwdRegex.test(password)) {
		return res.status(400).json({
			msg: 'Password must be at least 8 characters and contain only ASCII characters.',
		});
	}

	try {
		await checkAndConnectDB();
		const user = await User.findOne({
			email
		});

		if (!user) {
			return res.status(400).json({
				msg: 'Invalid credentials'
			});
		}

		if (user.googleId && !user.password) {
			return res.status(403).json({
				msg: 'Login with Google'
			});
		}

		if (!user.isEmailVerified) {
			return res.status(400).json({
				msg: 'Email not verified'
			});
		}

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(400).json({
				msg: 'Invalid credentials'
			});
		}

		user.lastLogin = new Date();
		await user.save();

		const token = signToken(user);

		res.json({
			token,
			username: user.username,
			isgoogleuser: false,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({
			msg: 'Server error'
		});
	}
}

module.exports = {
	login
};