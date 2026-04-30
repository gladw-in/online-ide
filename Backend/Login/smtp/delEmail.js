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

	let timerId;
	const timeout = new Promise((_, reject) => {
		timerId = setTimeout(() => reject(new Error('SMTP timeout')), 8000);
	});
	
	try {
		await Promise.race([transporter.sendMail(mailOptions), timeout]);
	} catch (error) {
		console.error('SMTP failed (non-fatal):', error.message);
	} finally {
		clearTimeout(timerId);
	}
}

module.exports = {
	sendDelEmail
};