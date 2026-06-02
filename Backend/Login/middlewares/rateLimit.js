const {
	Ratelimit
} = require('@upstash/ratelimit');
const {
	Redis
} = require('@upstash/redis');

const redis = new Redis({
	url: process.env.REDIS_URL,
	token: process.env.REDIS_PASSWORD,
});

const RATE_LIMIT_REQUESTS = parseInt(process.env.RATE_LIMIT_REQUESTS || '100', 10);
const RATE_LIMIT_WINDOW = process.env.RATE_LIMIT_WINDOW || '15 m';

const authLimiter = new Ratelimit({
	redis,
	limiter: Ratelimit.slidingWindow(RATE_LIMIT_REQUESTS, RATE_LIMIT_WINDOW),
	analytics: false,
	prefix: "onlineIdeAuth",
});

const rateLimit = async (req, res, next) => {
	let ip = req.ip || req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
	ip = ip.toString().split(',')[0].trim();

	const {
		success,
		remaining
	} = await authLimiter.limit(ip);

	if (!success) {
		return res.status(429).json({
			msg: 'Too many requests. Try again later.'
		});
	}

	next();
}

module.exports = {
	rateLimit
};