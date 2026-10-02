// Loads .env, applies defaults, and validates required environment variables.

require('dotenv').config();

const requiredEnv = [
	'MONGO_URI',
	'JWT_SECRET',
	'GOOGLE_CLIENT_ID',
	'RECAPTCHA_SECRET_KEY',
	'TURNSTILE_SECRET_KEY',
	'OTP_EMAIL_SERVICE',
	'OTP_EMAIL_USER',
	'OTP_EMAIL_PASS',
	'REDIS_URL',
	'REDIS_PASSWORD',
	'FRONTEND_URL',
];

const defaultEnv = {
	PORT: '5000',
	LOG_LEVEL: 'info',
	RECAPTCHA_THRESHOLD: '0.5',
	RATE_LIMIT_REQUESTS: '100',
	RATE_LIMIT_WINDOW: '15 m',
	HIBP_ENABLED: 'true',
	HIBP_TIMEOUT: '5000',
	HIBP_CACHE_TTL: '3600',
};

for (const [key, value] of Object.entries(defaultEnv)) {
	if (!process.env[key] || process.env[key].trim() === '') {
		process.env[key] = value;
	}
}

const missing = requiredEnv.filter(
	(key) => !process.env[key] || process.env[key].trim() === ''
);

if (missing.length > 0) {
	console.error('FATAL: Missing required environment variables:', missing.join(', '));
	throw new Error(`Missing env vars: ${missing.join(', ')}`);
}

const numericEnv = [
	'PORT',
	'RECAPTCHA_THRESHOLD',
	'RATE_LIMIT_REQUESTS',
	'HIBP_TIMEOUT',
	'HIBP_CACHE_TTL',
];

for (const key of numericEnv) {
	if (!Number.isFinite(Number(process.env[key]))) {
		throw new Error(`${key} must be a valid number`);
	}
}

if (!['true', 'false'].includes(process.env.HIBP_ENABLED)) {
	throw new Error('HIBP_ENABLED must be either "true" or "false"');
}

if (process.env.JWT_SECRET.length < 32) {
	throw new Error('JWT_SECRET must be at least 32 characters long');
}