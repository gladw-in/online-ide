const crypto = require('node:crypto');
const {
	Redis
} = require('@upstash/redis');

const redis = new Redis({
	url: process.env.REDIS_URL,
	token: process.env.REDIS_PASSWORD,
});

const checkPasswordLeak = async (password) => {
	if (process.env.HIBP_ENABLED === 'false') {
		return {
			leaked: false,
			breachCount: 0
		};
	}

	if (!password || typeof password !== 'string') {
		throw new Error('Password is required');
	}

	const sha1 = crypto
		.createHash('sha1')
		.update(password, 'utf8')
		.digest('hex')
		.toUpperCase();

	const prefix = sha1.slice(0, 5);
	const suffix = sha1.slice(5);

	let body;
	const cacheKey = `hibp:${prefix}`;

	try {
		const cached = await redis.get(cacheKey);
		if (cached) {
			body = cached;
		} else {
			const timeoutMs = parseInt(process.env.HIBP_TIMEOUT, 10) || 5000;
			const controller = new AbortController();
			const timeout = setTimeout(() => controller.abort(), timeoutMs);

			try {
				const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
					signal: controller.signal,
					headers: {
						'Add-Padding': 'true',
						'User-Agent': 'OnlineIDE/1.0',
					},
				});

				if (!response.ok) {
					throw new Error(`HIBP returned ${response.status}`);
				}

				body = await response.text();
				const ttl = parseInt(process.env.HIBP_CACHE_TTL, 10) || 3600;
				await redis.set(cacheKey, body, {
					ex: ttl
				});
			} catch (error) {
				console.error('HIBP check failed:', error.message);
				return {
					leaked: false,
					breachCount: 0
				};
			} finally {
				clearTimeout(timeout);
			}
		}
	} catch (redisError) {
		console.error('Redis error during HIBP cache:', redisError.message);
		return {
			leaked: false,
			breachCount: 0
		};
	}

	const lines = body.split('\r\n');
	for (const line of lines) {
		const [hashSuffix, count] = line.split(':');
		if (hashSuffix === suffix) {
			return {
				leaked: true,
				breachCount: Number(count),
			};
		}
	}

	return {
		leaked: false,
		breachCount: 0
	};
};

module.exports = {
	checkPasswordLeak
};