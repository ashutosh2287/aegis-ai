import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'staging')
    .default('development'),
  PORT: Joi.number().default(4000),
  // Supabase
  SUPABASE_URL: Joi.string().default('https://cdjxjddklqxhfhzasbaw.supabase.co'),
  SUPABASE_ANON_KEY: Joi.string().default('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkanhqZGRrbHF4aGZoemFzYmF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MzMyODUsImV4cCI6MjA5NzEwOTI4NX0.r37BT7XFyAMRCIT1C6we7qYRMEPYoChHNqznZyhNyyI'),
  SUPABASE_SERVICE_ROLE_KEY: Joi.string().default('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkanhqZGRrbHF4aGZoemFzYmF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MzMyODUsImV4cCI6MjA5NzEwOTI4NX0.r37BT7XFyAMRCIT1C6we7qYRMEPYoChHNqznZyhNyyI'),
  // JWT
  JWT_SECRET: Joi.string().required().default('super_secret_jwt_key_change_me'),
  JWT_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().required().default('super_secret_refresh_key_change_me'),
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
  // AI
  AI_PROVIDER: Joi.string().valid('openai', 'gemini', 'ollama').default('openai'),
  OPENAI_API_KEY: Joi.string().allow('').optional(),
  GEMINI_API_KEY: Joi.string().allow('').optional(),
  OLLAMA_BASE_URL: Joi.string().optional().default('http://localhost:11434'),
  AI_MODEL: Joi.string().optional(),
  AI_TEMPERATURE: Joi.number().min(0).max(2).default(0.7),
  REQUEST_TIMEOUT: Joi.number().default(120),
  // AI Model Routing (per-endpoint models)
  OLLAMA_CHAT_MODEL: Joi.string().optional(),
  OLLAMA_STRUCT_MODEL: Joi.string().optional(),
  OLLAMA_WORKOUT_MODEL: Joi.string().optional(),
  OLLAMA_NUTRITION_MODEL: Joi.string().optional(),
  OLLAMA_ANALYSIS_MODEL: Joi.string().optional(),
});