// Groups and exports all account route handlers.

const {
	protectedHandler
} = require('./protected');
const {
	accountDetails
} = require('./accountDetails');
const {
	changeUsername
} = require('./changeUsername');
const {
	changePassword
} = require('./changePassword');
const {
	deleteAccount
} = require('./deleteAccount');
const {
	verifyPassword
} = require('./verifyPassword');

module.exports = {
	protected: protectedHandler,
	accountDetails,
	changeUsername,
	changePassword,
	deleteAccount,
	verifyPassword,
};