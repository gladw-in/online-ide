const transporter = require('./transporter');

async function sendDelEmail(email) {
	const mailOptions = {
		from: process.env.OTP_EMAIL_USER,
		to: email,
		subject: 'Online IDE - Account Deletion Notice',
		html: `
            <html>
                <body>
                    <h2>Account Deleted</h2>
                    <p>Your Online IDE account has been deleted.</p>
                    <p>Thank you for having been a part of Online IDE.</p>
                </body>
            </html>
        `,
	};

	try {
		await transporter.sendMail(mailOptions);
	} catch (error) {
		throw new Error('Failed to send account deletion email');
	}
}

module.exports = { sendDelEmail  };
