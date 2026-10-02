// Defines the CORS policy that allows the frontend origin to call the API.

const corsOptions = {
	origin: process.env.FRONTEND_URL,
	methods: ['GET', 'POST', 'PUT', 'DELETE'],
	allowedHeaders: ['Content-Type', 'Authorization', 'x-recaptcha-token'],
	credentials: false,
};

module.exports = corsOptions;