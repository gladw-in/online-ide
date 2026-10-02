// Groups and exports all authentication route handlers.

const {
	register
} = require('./register');
const {
	login
} = require('./login');
const {
	googleAuth
} = require('./googleAuth');
const {
	verifyOtp
} = require('./verifyOtp');
const {
	resendOtp
} = require('./resendOtp');
const {
	wrongEmail
} = require('./wrongEmail');
const {
	checkEmailExists
} = require('./checkEmailExists');
const {
	forgotPassword
} = require('./forgotPassword');
const {
	resetPassword
} = require('./resetPassword');
const {
	updatePassword
} = require('./updatePassword');

module.exports = {
	register,
	login,
	googleAuth,
	verifyOtp,
	resendOtp,
	wrongEmail,
	checkEmailExists,
	forgotPassword,
	resetPassword,
	updatePassword,
};