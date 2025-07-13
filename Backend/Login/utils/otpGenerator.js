const crypto = require('node:crypto');

function generateOtp() {
  return crypto.randomBytes(3).toString('hex');
}

module.exports = { generateOtp };
