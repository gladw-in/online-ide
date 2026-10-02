// Declares every route for creating, listing, and deleting shared code links.

const express = require('express');
const router = express.Router();

const {
	rateLimit
} = require('../middlewares/rateLimit');
const {
	verifyRecaptcha
} = require('../middlewares/verifyRecaptcha');
const sharedLinkController = require('../controllers/sharedLinkController');

router.post('/sharedLink/count', rateLimit, verifyRecaptcha, sharedLinkController.createSharedLink);
router.post('/user/sharedLinks', rateLimit, sharedLinkController.getSharedLinks);
router.delete('/sharedLink', rateLimit, verifyRecaptcha, sharedLinkController.deleteSharedLink);
router.delete('/user/sharedLink/:shareId', rateLimit, verifyRecaptcha, sharedLinkController.deleteSharedLinkByParam);

module.exports = router;