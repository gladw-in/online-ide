const axios = require("axios");

const verifyTurnstile = async (req, res, next) => {
	const token = req.body.turnstileToken;
	if (!token) return res.status(400).json({
		msg: "CAPTCHA token missing"
	});

	let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
	ip = ip?.toString().split(",")[0];

	try {
		const response = await axios.post(
			"https://challenges.cloudflare.com/turnstile/v0/siteverify",
			new URLSearchParams({
				secret: process.env.TURNSTILE_SECRET_KEY,
				response: token,
				remoteip: ip
			}), {
				timeout: 5000
			}
		);

		if (response.data.success) return next();
		return res.status(403).json({
			msg: "CAPTCHA verification failed"
		});
	} catch (err) {
		return res.status(500).json({
			msg: "CAPTCHA error"
		});
	}
}

module.exports = {
	verifyTurnstile
};