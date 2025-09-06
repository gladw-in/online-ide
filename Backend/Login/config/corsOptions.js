const corsOptions = {
	origin: '*',
	methods: ['GET', 'POST', 'PUT', 'DELETE'],
	allowedHeaders: ['Content-Type', 'Authorization', 'x-recaptcha-token'],
	credentials: true,
};

module.exports = corsOptions;
