const crypto = require('node:crypto');

const generateOtp = () => {
	const MAX_VALID = Math.floor(0xFFFFFFFF / 1_000_000) * 1_000_000;

	let num;
	do {
		num = crypto.randomBytes(4).readUInt32BE(0);
	} while (num >= MAX_VALID);

	return String(num % 1_000_000).padStart(6, '0');
}

module.exports = {
	generateOtp
};