// Declares the routes that increment per-language usage counters.

const express = require('express');
const router = express.Router();

const {
	rateLimit
} = require('../middlewares/rateLimit');
const {
	verifyRecaptcha
} = require('../middlewares/verifyRecaptcha');
const usageController = require('../controllers/usageController');

router.post('/runCode/count', rateLimit, verifyRecaptcha, usageController.runCodeCount);
router.post('/generateCode/count', rateLimit, verifyRecaptcha, usageController.generateCodeCount);
router.post('/refactorCode/count', rateLimit, verifyRecaptcha, usageController.refactorCodeCount);

module.exports = router;