// Declares every authenticated account route (details, change password, delete, etc).

const express = require('express');
const router = express.Router();

const {
	rateLimit
} = require('../middlewares/rateLimit');
const {
	verifyTurnstile
} = require('../middlewares/verifyTurnstile');
const {
	verifyRecaptcha
} = require('../middlewares/verifyRecaptcha');
const accountController = require('../controllers/accountController');

router.get('/protected', rateLimit, accountController.protected);
router.post('/account-details', rateLimit, verifyRecaptcha, accountController.accountDetails);
router.put('/change-username', rateLimit, verifyRecaptcha, accountController.changeUsername);
router.put('/change-password', rateLimit, verifyRecaptcha, accountController.changePassword);
router.delete('/account', rateLimit, verifyTurnstile, verifyRecaptcha, accountController.deleteAccount);
router.post('/verify-password', rateLimit, verifyRecaptcha, accountController.verifyPassword);

module.exports = router;