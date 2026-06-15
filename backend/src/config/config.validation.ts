import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'staging')
    .default('development'),
  PORT: Joi.number().default(4000),
  // Supabase
  SUPABASE_URL: Joi.string().required(),
  SUPABASE_ANON_KEY: Joi.string().required(),
  SUPABASE_SERVICE_ROLE_KEY: Joi.string().required(),
  // JWT
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
  JWT_REFRESH_EXPIRES_IN_MS: Joi.number().default(7 * 24 * 60 * 60 * 1000), // 7 days in milliseconds
  // Web URL for OAuth callbacks and reset password redirects
  WEB_URL: Joi.string().required(),
  // Throttler
  THROTTLE_TTL: Joi.number().default(60),
  THROTTLE_LIMIT: Joi.number().default(10),
  // Uploads
  UPLOAD_DIR: Joi.string().default('uploads'),
  // API
  API_PREFIX: Joi.string().default('api'),
  // Swagger
  SWAGGER_ENABLED: Joi.boolean().default(true),
});