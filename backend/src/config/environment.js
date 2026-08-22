require('dotenv').config();

/**
 * Centralized environment configuration.
 * Every other file should read config from here instead of process.env directly,
 * so business rules (delivery fees, thresholds, WhatsApp number) have one source of truth.
 */
module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',

  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/buea_online_shop',

  JWT_SECRET: process.env.JWT_SECRET || 'dev_only_secret_change_me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  EMAIL_HOST: process.env.EMAIL_HOST || '',
  EMAIL_PORT: process.env.EMAIL_PORT || '',
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || '',

  MTN_API_KEY: process.env.MTN_API_KEY || '',
  MTN_API_SECRET: process.env.MTN_API_SECRET || '',
  ORANGE_API_KEY: process.env.ORANGE_API_KEY || '',
  ORANGE_API_SECRET: process.env.ORANGE_API_SECRET || '',
  PAYMENT_SECRET: process.env.PAYMENT_SECRET || '',

  WHATSAPP_BUSINESS_NUMBER: process.env.WHATSAPP_BUSINESS_NUMBER || '237670000000',

  // Business rules - single source of truth, read by order.service.js
  DELIVERY_FREE_THRESHOLD: parseInt(process.env.DELIVERY_FREE_THRESHOLD, 10) || 10000,
  DELIVERY_FEE_STANDARD: parseInt(process.env.DELIVERY_FEE_STANDARD, 10) || 1000,
  DEFAULT_DELIVERY_CITY: process.env.DEFAULT_DELIVERY_CITY || 'Buea',
};
