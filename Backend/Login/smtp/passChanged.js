const transporter = require('./transporter');

async function sendPassChangeEmail(email) {
	const mailOptions = {
		from: process.env.OTP_EMAIL_USER,
		to: email,
		subject: 'Online IDE - Password Change Notification',
		html: `
            <html>
                <body>
                    <h2>Password Changed</h2>
                    <p>Your Online IDE account password has been successfully changed.</p>
                    <p>If you did not request this change, please contact support immediately.</p>
                    <p>Thank you for using Online IDE.</p>
                </body>
            </html>
        `,
	};

	try {
		await transporter.sendMail(mailOptions);
	} catch (error) {
		throw new Error('Failed to send password change notification email');
	}
}

module.exports = { sendPassChangeEmail };
