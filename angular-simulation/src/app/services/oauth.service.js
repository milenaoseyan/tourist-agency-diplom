const axios = require('axios');
const qs = require('querystring');
const User = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

class OAuthService {
  constructor() {
    this.providers = {
      google: {
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        userInfoUrl: 'https://www.googleapis.com/oauth2/v3/userinfo',
        scope: 'profile email',
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackUrl: process.env.GOOGLE_CALLBACK_URL
      },
      github: {
        authUrl: 'https://github.com/login/oauth/authorize',
        tokenUrl: 'https://github.com/login/oauth/access_token',
        userInfoUrl: 'https://api.github.com/user',
        emailsUrl: 'https://api.github.com/user/emails',
        scope: 'user:email',
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackUrl: process.env.GITHUB_CALLBACK_URL
      },
      vk: {
        authUrl: 'https://oauth.vk.com/authorize',
        tokenUrl: 'https://oauth.vk.com/access_token',
        userInfoUrl: 'https://api.vk.com/method/users.get',
        scope: 'email',
        clientId: process.env.VK_CLIENT_ID,
        clientSecret: process.env.VK_CLIENT_SECRET,
        callbackUrl: process.env.VK_CALLBACK_URL,
        apiVersion: '5.131'
      }
    };
  }

  /**
   * Генерация URL для OAuth авторизации
   * @param {string} provider - Провайдер
   * @param {string} state - Состояние для CSRF защиты
   * @returns {string} URL для редиректа
   */
  getAuthUrl(provider, state) {
    const config = this.providers[provider];
    if (!config) throw new AppError('Неподдерживаемый провайдер OAuth', 400);

    const params = {
      client_id: config.clientId,
      redirect_uri: config.callbackUrl,
      response_type: 'code',
      scope: config.scope,
      state,
      access_type: 'offline',
      prompt: 'consent'
    };

    // Добавляем параметры для конкретных провайдеров
    if (provider === 'vk') {
      params.v = config.apiVersion;
    }

    return `${config.authUrl}?${qs.stringify(params)}`;
  }

  /**
   * Получение токена по коду авторизации
   * @param {string} provider - Провайдер
   * @param {string} code - Код авторизации
   * @returns {Promise<Object>} Токен и данные пользователя
   */
  async getToken(provider, code) {
    const config = this.providers[provider];
    
    try {
      let response;
      
      if (provider === 'github') {
        response = await axios.post(config.tokenUrl, {
          client_id: config.clientId,
          client_secret: config.clientSecret,
          code,
          redirect_uri: config.callbackUrl
        }, {
          headers: {
            Accept: 'application/json'
          }
        });
      } else {
        response = await axios.post(config.tokenUrl, qs.stringify({
          client_id: config.clientId,
          client_secret: config.clientSecret,
          code,
          redirect_uri: config.callbackUrl,
          grant_type: 'authorization_code'
        }), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
      }

      return response.data;
    } catch (error) {
      console.error(`Ошибка получения OAuth токена (${provider}):`, error.response?.data || error.message);
      throw new AppError('Не удалось получить токен от провайдера', 401);
    }
  }

  /**
   * Получение информации о пользователе
   * @param {string} provider - Провайдер
   * @param {string} accessToken - Токен доступа
   * @returns {Promise<Object>} Данные пользователя
   */
  async getUserInfo(provider, accessToken) {
    const config = this.providers[provider];
    
    try {
      let userData = {};
      
      switch (provider) {
        case 'google':
          const googleResponse = await axios.get(config.userInfoUrl, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          userData = this.normalizeGoogleData(googleResponse.data);
          break;
          
        case 'github':
          const [githubUser, githubEmails] = await Promise.all([
            axios.get(config.userInfoUrl, {
              headers: { Authorization: `token ${accessToken}` }
            }),
            axios.get(config.emailsUrl, {
              headers: { Authorization: `token ${accessToken}` }
            })
          ]);
          
          userData = this.normalizeGithubData(githubUser.data, githubEmails.data);
          break;
          
        case 'vk':
          const vkResponse = await axios.get(config.userInfoUrl, {
            params: {
              v: config.apiVersion,
              access_token: accessToken,
              fields: 'photo_200,email'
            }
          });
          
          if (vkResponse.data.response && vkResponse.data.response.length > 0) {
            userData = this.normalizeVkData(vkResponse.data.response[0], accessToken);
          }
          break;
      }
      
      return userData;
    } catch (error) {
      console.error(`Ошибка получения данных пользователя (${provider}):`, error.response?.data || error.message);
      throw new AppError('Не удалось получить данные пользователя', 401);
    }
  }

  /**
   * Нормализация данных Google
   * @private
   */
  normalizeGoogleData(data) {
    return {
      provider: 'google',
      providerId: data.sub,
      email: data.email,
      name: data.name,
      avatar: data.picture,
      emailVerified: data.email_verified
    };
  }

  /**
   * Нормализация данных GitHub
   * @private
   */
  normalizeGithubData(user, emails) {
    const primaryEmail = emails.find(e => e.primary && e.verified) || emails[0];
    
    return {
      provider: 'github',
      providerId: user.id.toString(),
      email: primaryEmail?.email || `${user.login}@users.noreply.github.com`,
      name: user.name || user.login,
      avatar: user.avatar_url,
      profileUrl: user.html_url,
      emailVerified: primaryEmail?.verified || false
    };
  }

  /**
   * Нормализация данных VK
   * @private
   */
  normalizeVkData(user, accessToken) {
    return {
      provider: 'vk',
      providerId: user.id.toString(),
      email: user.email || `${user.id}@vk.com`,
      name: `${user.first_name} ${user.last_name}`,
      avatar: user.photo_200,
      profileUrl: `https://vk.com/id${user.id}`,
      emailVerified: !!user.email
    };
  }

  /**
   * Создание или обновление пользователя из OAuth данных
   * @param {Object} profile - Профиль пользователя
   * @returns {Promise<Object>} Пользователь
   */
  async findOrCreateUser(profile) {
    const { provider, providerId, email, name, avatar, profileUrl } = profile;

    // Ищем пользователя по OAuth провайдеру
    let user = await User.findOne({
      'oauthProviders.provider': provider,
      'oauthProviders.providerId': providerId
    });

    if (!user) {
      // Ищем по email
      user = await User.findOne({ email });
      
      if (user) {
        // Добавляем OAuth провайдер к существующему пользователю
        user.oauthProviders.push({
          provider,
          providerId,
          email,
          name,
          avatar,
          profileUrl,
          lastUsed: new Date()
        });
        
        // Если у пользователя нет аватара, используем из OAuth
        if (!user.avatar || user.avatar === 'default-avatar.jpg') {
          user.avatar = avatar;
        }
        
        await user.save({ validateBeforeSave: false });
      } else {
        // Создаем нового пользователя
        const randomPassword = require('crypto').randomBytes(32).toString('hex');
        
        user = await User.create({
          name: name || 'User',
          email,
          password: randomPassword,
          passwordConfirm: randomPassword,
          avatar: avatar || 'default-avatar.jpg',
          emailVerified: profile.emailVerified || true,
          oauthProviders: [{
            provider,
            providerId,
            email,
            name,
            avatar,
            profileUrl,
            lastUsed: new Date()
          }]
        });
      }
    } else {
      // Обновляем время последнего использования
      const providerData = user.oauthProviders.find(p => p.provider === provider);
      if (providerData) {
        providerData.lastUsed = new Date();
        providerData.avatar = avatar;
        providerData.name = name;
        await user.save({ validateBeforeSave: false });
      }
    }

    return user;
  }

  /**
   * Получение списка подключенных OAuth провайдеров
   * @param {string} userId - ID пользователя
   * @returns {Promise<Array>} Список провайдеров
   */
  async getUserProviders(userId) {
    const user = await User.findById(userId).select('oauthProviders');
    return user?.oauthProviders || [];
  }

  /**
   * Отключение OAuth провайдера
   * @param {string} userId - ID пользователя
   * @param {string} provider - Провайдер
   * @returns {Promise<void>}
   */
  async disconnectProvider(userId, provider) {
    const user = await User.findById(userId);
    
    // Проверяем, что у пользователя есть пароль (не только OAuth)
    if (!user.password) {
      throw new AppError('Нельзя отключить единственный способ входа. Установите пароль.', 400);
    }
    
    user.oauthProviders = user.oauthProviders.filter(p => p.provider !== provider);
    await user.save({ validateBeforeSave: false });
  }
}

module.exports = new OAuthService();