// Authenticates or creates a user through Google Sign-In and returns a JWT.

const {
	randomBytes
} = require('crypto');
const {
	OAuth2Client
} = require('google-auth-library');
const User = require('../../models/User');
const {
	sanitizeUsername
} = require('../../utils/validation');
const {
	checkAndConnectDB
} = require('../../config/db');
const signToken = require('../../utils/signToken');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

async function googleAuth(req, res) {
	const {
		token
	} = req.body;

	if (!token) {
		return res.status(401).json({
			msg: 'Token is required'
		});
	}

	try {
		await checkAndConnectDB();
		const ticket = await client.verifyIdToken({
			idToken: token,
			audience: GOOGLE_CLIENT_ID,
		});

		const payload = ticket.getPayload();
		const {
			email,
			name,
			sub: googleId
		} = payload;

		let user = await User.findOne({
			email
		});
		let finalUsername;

		if (!user) {
			let baseUsername = sanitizeUsername(name);
			finalUsername = baseUsername;
			let tries = 0;
			let saved = false;

			while (!saved && tries < 10) {
				try {
					user = new User({
						username: finalUsername,
						email: email,
						googleId: googleId,
						isEmailVerified: !!googleId,
					});
					await user.save();
					saved = true;
				} catch (err) {
					if (err.code === 11000 && err.keyPattern?.username) {
						finalUsername = `${baseUsername}_${randomBytes(3).toString('hex')}`;
						tries++;
					} else {
						throw err;
					}
				}
			}

			if (!saved) {
				return res.status(500).json({
					message: 'Unable to generate unique username.'
				});
			}
		} else {
			user.lastLogin = new Date();
			if (!user.googleId) {
				user.googleId = googleId;
			}
			if (!user.isEmailVerified) {
				user.isEmailVerified = true;
			}
			await user.save();
		}

		const appToken = signToken(user);

		res.status(200).json({
			message: 'Authentication successful!',
			token: appToken,
			username: user.username,
			isgoogleuser: true,
		});
	} catch (err) {
		console.error('Google auth error:', err);
		res.status(401).json({
			message: 'Invalid Google token or authentication failed.'
		});
	}
}

module.exports = {
	googleAuth
};