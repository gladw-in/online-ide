const crypto = require('node:crypto');

const generateOtp = () => {
	const num = crypto.randomBytes(4).readUInt32BE(0) % 1_000_000;
	return String(num).padStart(6, '0');
}

module.exports = {
	generateOtp
};