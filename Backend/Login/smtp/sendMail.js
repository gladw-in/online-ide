const transporter = require('./transporter')

async function sendOtpEmail(email, otp) {
	const mailOptions = {
		from: process.env.OTP_EMAIL_USER,
		to: email,
		subject: 'Online IDE - Your OTP for Email Verification',
		html: `
            <html>
                <body>
                    <h2>Welcome to Our Online IDE!</h2>
                    <p>We received a request to verify your email address.</p>
                    <p>To complete your email verification, please use the OTP below:</p>
                    <h3 style="color: #4CAF50;">Your OTP: <strong>${otp}</strong></h3>
                    <p><i>This OTP will expire in 10 minutes. If you did not request this, please ignore this email.</i></p>
                    <p><a href="#" target="_blank" style="color: #007BFF;">Online IDE</a></p>
                    <p>Thank you for choosing our service!</p>
                </body>
            </html>
        `,
	};

	try {
		await transporter.sendMail(mailOptions);
	} catch (error) {
		throw new Error('Failed to send OTP email');
	}
}

module.exports = {sendOtpEmail};