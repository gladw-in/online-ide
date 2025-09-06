const axios = require('axios');

const verifyRecaptcha = async (req, res, next) => {
	const secretKey = process.env.RECAPTCHA_SECRET_KEY;
	const token = req.headers['x-recaptcha-token'];

	if (!token) {
		return res.status(403).json({
			msg: "reCAPTCHA token is missing."
		});
	}
	if (!secretKey) {
		return res.status(500).json({
			msg: "Server configuration error."
		});
	}

	try {
		const verificationUrl = 'https://www.google.com/recaptcha/api/siteverify';

		const body = new URLSearchParams({
			secret: secretKey,
			response: token,
		}).toString();

		const response = await axios.post(verificationUrl, body, {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		});

		const {
			success,
			score
		} = response.data;

		if (success && score >= 0.5) {
			next();
		} else {
			return res.status(403).json({
				msg: 'reCAPTCHA verification failed.'
			});
		}
	} catch (error) {
		return res.status(500).json({
			msg: 'Server error during reCAPTCHA verification.'
		});
	}
};

module.exports = { verifyRecaptcha };