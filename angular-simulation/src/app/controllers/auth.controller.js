const twoFactorService = require('../services/twoFactor.service');
const oauthService = require('../services/oauth.service');
const encryption = require('../utils/encryption');
const AppError = require('../utils/appError');

/**
 * Включение 2FA
 */
exports.enableTwoFactor = catchAsync(async (req, res, next) => {
  const user = req.user;

  if (user.twoFactorEnabled) {
    return next(new AppError('2FA уже включена', 400));
  }

  // Генерируем секрет и QR код
  const { secret, qrCode, base32 } = await twoFactorService.generateSecret(user.email);

  // Генерируем резервные коды
  const backupCodes = twoFactorService.generateBackupCodes();

  // Сохраняем данные пользователя
  user.twoFactorSecret = secret;
  user.twoFactorBackupCodes = backupCodes.map(({ code, plainCode }) => ({
    code,
    plainCode,
    used: false,
    createdAt: new Date()
  }));
  
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    data: {
      secret: base32,
      qrCode,
      backupCodes: backupCodes.map(c => c.plainCode)
    }
  });
});

/**
 * Подтверждение 2FA
 */
exports.verifyTwoFactor = catchAsync(async (req, res, next) => {
  const { token } = req.body;
  const user = req.user;

  if (!user.twoFactorSecret) {
    return next(new AppError('2FA не настроена', 400));
  }

  const isValid = twoFactorService.verifyToken(token, user.twoFactorSecret);

  if (!isValid) {
    // Проверяем резервные коды
    const backupResult = twoFactorService.verifyBackupCode(
      token, 
      user.twoFactorBackupCodes || []
    );

    if (!backupResult.valid) {
      return next(new AppError('Неверный код 2FA', 401));
    }

    // Сохраняем использованный код
    await user.save({ validateBeforeSave: false });
  }

  // Включаем 2FA
  user.twoFactorEnabled = true;
  await user.save({ validateBeforeSave: false });

  // Генерируем JWT
  const jwtToken = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token: jwtToken,
    data: {
      user
    }
  });
});

/**
 * Отключение 2FA
 */
exports.disableTwoFactor = catchAsync(async (req, res, next) => {
  const user = req.user;

  user.twoFactorEnabled = false;
  user.twoFactorSecret = undefined;
  user.twoFactorBackupCodes = undefined;
  
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    message: '2FA отключена'
  });
});

/**
 * Генерация новых резервных кодов
 */
exports.generateBackupCodes = catchAsync(async (req, res, next) => {
  const user = req.user;

  const backupCodes = twoFactorService.generateBackupCodes();
  
  user.twoFactorBackupCodes = backupCodes.map(({ code, plainCode }) => ({
    code,
    plainCode,
    used: false,
    createdAt: new Date()
  }));
  
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    data: {
      backupCodes: backupCodes.map(c => c.plainCode)
    }
  });
});

/**
 * Проверка статуса 2FA
 */
exports.getTwoFactorStatus = catchAsync(async (req, res, next) => {
  const user = req.user;

  res.status(200).json({
    status: 'success',
    data: {
      enabled: user.twoFactorEnabled || false,
      hasSecret: !!user.twoFactorSecret,
      backupCodesCount: user.twoFactorBackupCodes?.filter(c => !c.used).length || 0
    }
  });
});

/**
 * OAuth редирект
 */
exports.oauthRedirect = (req, res) => {
  const { provider } = req.params;
  const state = encryption.generateSecureToken(16);
  
  // Сохраняем state в сессии для проверки
  req.session.oauthState = state;
  
  const authUrl = oauthService.getAuthUrl(provider, state);
  
  res.redirect(authUrl);
};

/**
 * OAuth callback
 */
exports.oauthCallback = catchAsync(async (req, res, next) => {
  const { provider } = req.params;
  const { code, state } = req.query;

  // Проверка state от CSRF
  if (state !== req.session.oauthState) {
    return next(new AppError('Недействительный state параметр', 403));
  }

  // Получаем токен
  const tokenData = await oauthService.getToken(provider, code);

  // Получаем информацию о пользователе
  const accessToken = tokenData.access_token || tokenData.token;
  const profile = await oauthService.getUserInfo(provider, accessToken);

  // Создаем или обновляем пользователя
  const user = await oauthService.findOrCreateUser(profile);

  // Добавляем в историю входов
  await user.addLoginHistory({
    ip: req.ip,
    userAgent: req.get('user-agent'),
    success: true,
    provider
  });

  // Генерируем JWT
  const jwtToken = signToken(user._id);

  // Очищаем state из сессии
  delete req.session.oauthState;

  // Перенаправляем на фронтенд с токеном
  res.redirect(`${process.env.CLIENT_URL}/auth/success?token=${jwtToken}`);
});

/**
 * Получение подключенных OAuth провайдеров
 */
exports.getOAuthProviders = catchAsync(async (req, res, next) => {
  const providers = await oauthService.getUserProviders(req.user._id);

  res.status(200).json({
    status: 'success',
    data: {
      providers
    }
  });
});

/**
 * Отключение OAuth провайдера
 */
exports.disconnectOAuthProvider = catchAsync(async (req, res, next) => {
  const { provider } = req.params;

  await oauthService.disconnectProvider(req.user._id, provider);

  res.status(200).json({
    status: 'success',
    message: `Провайдер ${provider} отключен`
  });
});

/**
 * Получение истории входов
 */
exports.getLoginHistory = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('loginHistory');

  res.status(200).json({
    status: 'success',
    data: {
      history: user.loginHistory || []
    }
  });
});

/**
 * Получение доверенных устройств
 */
exports.getTrustedDevices = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('trustedDevices');

  res.status(200).json({
    status: 'success',
    data: {
      devices: user.trustedDevices || []
    }
  });
});

/**
 * Удаление доверенного устройства
 */
exports.removeTrustedDevice = catchAsync(async (req, res, next) => {
  const { deviceId } = req.params;
  const user = req.user;

  user.trustedDevices = user.trustedDevices.filter(d => d.deviceId !== deviceId);
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    message: 'Устройство удалено'
  });
});