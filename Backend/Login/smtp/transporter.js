const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
	service: process.env.OTP_EMAIL_SERVICE,
	auth: {
		user: process.env.OTP_EMAIL_USER,
		pass: process.env.OTP_EMAIL_PASS,
	},
});

module.exports = transporter;
