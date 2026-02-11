const express = require('express');
const authController = require('../controllers/auth.controller');
const securityMiddleware = require('../middleware/security.middleware');
const csrfMiddleware = require('../middleware/csrf.middleware');

const router = express.Router();

// Публичные роуты
router.post('/register', 
  securityMiddleware.authLimiter,
  authController.register
);

router.post('/login', 
  securityMiddleware.authLimiter,
  authController.login
);

router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);

// OAuth роуты
router.get('/:provider', authController.oauthRedirect);
router.get('/:provider/callback', authController.oauthCallback);

// Защищенные роуты (требуют аутентификации)
router.use(authController.protect);

// 2FA роуты
router.get('/2fa/status', authController.getTwoFactorStatus);
router.post('/2fa/enable', authController.enableTwoFactor);
router.post('/2fa/verify', authController.verifyTwoFactor);
router.post('/2fa/disable', authController.disableTwoFactor);
router.post('/2fa/backup-codes', authController.generateBackupCodes);

// OAuth управление
router.get('/oauth/providers', authController.getOAuthProviders);
router.delete('/oauth/:provider', authController.disconnectOAuthProvider);

// Безопасность
router.get('/security/history', authController.getLoginHistory);
router.get('/security/devices', authController.getTrustedDevices);
router.delete('/security/devices/:deviceId', authController.removeTrustedDevice);

// Проверка 2FA при входе (специальный роут)
router.post('/verify-2fa', 
  securityMiddleware.twoFALimiter,
  authController.verifyTwoFactorLogin
);

module.exports = router;