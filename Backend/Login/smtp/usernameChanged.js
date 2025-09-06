const transporter = require('./transporter');

async function sendUsernameChangeEmail(email, oldUsername, newUsername) {
	const mailOptions = {
		from: process.env.OTP_EMAIL_USER,
		to: email,
		subject: 'Online IDE - Username Change Notification',
		html: `
            <html>
                <body>
                    <h2>Username Changed</h2>
                    <p>Your Online IDE account username has been successfully changed.</p>
                    <p>Old Username: <strong>${oldUsername}</strong></p>
                    <p>New Username: <strong>${newUsername}</strong></p>
                    <p>If you did not request this change, please contact support immediately.</p>
                    <p>Thank you for using Online IDE.</p>
                </body>
            </html>
        `,
	};

	try {
		await transporter.sendMail(mailOptions);
	} catch (error) {
		throw new Error('Failed to send username change notification email');
	}
}

module.exports = { sendUsernameChangeEmail };
