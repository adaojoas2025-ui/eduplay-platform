const Joi = require('joi');
const logger = require('../utils/logger');

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().required().min(32),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  JWT_REFRESH_SECRET: Joi.string().required().min(32),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),
  MP_ACCESS_TOKEN: Joi.string().default(''),
  MP_PUBLIC_KEY: Joi.string().default(''),
  MP_CLIENT_ID: Joi.string().default(''),
  MP_CLIENT_SECRET: Joi.string().default(''),
  MP_REDIRECT_URI: Joi.string().default(''),
  CLOUDINARY_CLOUD_NAME: Joi.string(),
  CLOUDINARY_API_KEY: Joi.string(),
  CLOUDINARY_API_SECRET: Joi.string(),
  EMAIL_HOST: Joi.string().default('smtp.gmail.com'),
  EMAIL_PORT: Joi.number().default(587),
  EMAIL_USER: Joi.string(),
  EMAIL_PASS: Joi.string(),
  EMAIL_FROM: Joi.string(),
  FRONTEND_URL: Joi.string().uri().required(),
  BACKEND_URL: Joi.string().uri().required(),
  PLATFORM_FEE_PERCENT: Joi.number().min(0).max(100).default(10),
  PLATFORM_NAME: Joi.string().default('EducaplayJA'),
  PLATFORM_EMAIL: Joi.string().email().default('contato@educaplayja.com.br'),
  PLATFORM_SUPPORT_EMAIL: Joi.string().email().default('suporte@educaplayja.com.br'),
  BCRYPT_ROUNDS: Joi.number().default(10),
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
  LOG_DIR: Joi.string().default('logs'),
}).unknown();

const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  logger.error(`Config validation error: ${error.message}`);
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  database: { url: envVars.DATABASE_URL },
  jwt: {
    secret: envVars.JWT_SECRET,
    expiresIn: envVars.JWT_EXPIRES_IN,
    refreshSecret: envVars.JWT_REFRESH_SECRET,
    refreshExpiresIn: envVars.JWT_REFRESH_EXPIRES_IN,
  },
  mercadopago: {
    accessToken: envVars.MP_ACCESS_TOKEN,
    publicKey: envVars.MP_PUBLIC_KEY,
    clientId: envVars.MP_CLIENT_ID,
    clientSecret: envVars.MP_CLIENT_SECRET,
    redirectUri: envVars.MP_REDIRECT_URI,
  },
  cloudinary: {
    cloudName: envVars.CLOUDINARY_CLOUD_NAME,
    apiKey: envVars.CLOUDINARY_API_KEY,
    apiSecret: envVars.CLOUDINARY_API_SECRET,
  },
  email: {
    host: envVars.EMAIL_HOST,
    port: envVars.EMAIL_PORT,
    user: envVars.EMAIL_USER,
    pass: envVars.EMAIL_PASS,
    from: envVars.EMAIL_FROM,
  },
  urls: {
    frontend: envVars.FRONTEND_URL,
    backend: envVars.BACKEND_URL,
  },
  platform: {
    name: envVars.PLATFORM_NAME,
    email: envVars.PLATFORM_EMAIL,
    supportEmail: envVars.PLATFORM_SUPPORT_EMAIL,
    feePercent: envVars.PLATFORM_FEE_PERCENT,
  },
  security: {
    bcryptRounds: envVars.BCRYPT_ROUNDS,
  },
  log: {
    level: envVars.LOG_LEVEL,
    dir: envVars.LOG_DIR,
  },
  frontend: {
    url: envVars.FRONTEND_URL,
  },
  backend: {
    url: envVars.BACKEND_URL,
  },
};
