// Boots the express app, checks required env vars, and mounts all API routes.

require('./config/env');

const express = require('express');
const path = require('node:path');
const helmet = require('helmet');
const pino = require('pino');
const pinoHttp = require('pino-http');
const cors = require('cors');

const corsOptions = require('./config/corsOptions');

const authRoutes = require('./routes/authRoutes');
const accountRoutes = require('./routes/accountRoutes');
const usageRoutes = require('./routes/usageRoutes');
const sharedLinkRoutes = require('./routes/sharedLinkRoutes');

const app = express();

const logger = pino({
	level: process.env.LOG_LEVEL,
	base: {
		service: 'online-ide-backend'
	}
});

app.use(pinoHttp({
	logger
}));

app.use(
	helmet({
		contentSecurityPolicy: {
			useDefaults: true,
			directives: {
				defaultSrc: ["'self'"],
				frameAncestors: ["'none'"],
				objectSrc: ["'none'"],
				baseUri: ["'self'"]
			}
		},
		frameguard: {
			action: "deny"
		},
		referrerPolicy: {
			policy: "no-referrer"
		}
	})
);

app.use((req, res, next) => {
	res.setHeader("Strict-Transport-Security", "max-age=31536000");
	res.setHeader("X-Content-Type-Options", "nosniff");
	res.setHeader("Permissions-Policy", "geolocation=(), camera=(), microphone=()");
	next();
});

app.set('trust proxy', 1);
app.use(cors(corsOptions));

app.use(express.json({
	limit: '100kb'
}));

const PORT = process.env.PORT;

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'templates/index.html'));
});

app.use('/api', authRoutes);
app.use('/api', accountRoutes);
app.use('/api', usageRoutes);
app.use('/api', sharedLinkRoutes);

app.use((req, res) => {
	res.status(404).json({
		msg: 'Not found'
	});
});

app.use((err, req, res, next) => {
	console.error(err);
	if (res.headersSent) {
		return next(err);
	}

	res.status(500).json({
		msg: 'Server error'
	});
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));