import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-.env',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  // Optional Redis URL; if not set, caching will be disabled gracefully
  redisUrl: process.env.REDIS_URL
};

export function assertEnv() {
  if (!env.databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }
  if (!env.jwtSecret) {
    throw new Error('JWT_SECRET is required');
  }
}



