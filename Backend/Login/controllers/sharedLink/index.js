// Groups and exports all shared-link route handlers.

const {
	createSharedLink
} = require('./createSharedLink');
const {
	getSharedLinks
} = require('./getSharedLinks');
const {
	deleteSharedLink
} = require('./deleteSharedLink');
const {
	deleteSharedLinkByParam
} = require('./deleteSharedLinkByParam');

module.exports = {
	createSharedLink,
	getSharedLinks,
	deleteSharedLink,
	deleteSharedLinkByParam,
};