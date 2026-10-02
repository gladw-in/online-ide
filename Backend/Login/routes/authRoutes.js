// Declares every authentication route (register, login, OTP, password reset, etc).

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
const authController = require('../controllers/authController');

router.post('/register', rateLimit, verifyTurnstile, verifyRecaptcha, authController.register);
router.post('/login', rateLimit, verifyTurnstile, verifyRecaptcha, authController.login);
router.post('/auth/google', rateLimit, verifyTurnstile, verifyRecaptcha, authController.googleAuth);
router.post('/verify-otp', rateLimit, verifyRecaptcha, authController.verifyOtp);
router.post('/resend-otp', rateLimit, verifyRecaptcha, authController.resendOtp);
router.delete('/wrong-email', rateLimit, verifyRecaptcha, authController.wrongEmail);
router.post('/check-email-exists', rateLimit, verifyTurnstile, verifyRecaptcha, authController.checkEmailExists);
router.post('/forgot-password', rateLimit, verifyRecaptcha, authController.forgotPassword);
router.post('/reset-password', rateLimit, verifyRecaptcha, authController.resetPassword);
router.post('/update-password', rateLimit, verifyRecaptcha, authController.updatePassword);

module.exports = router;