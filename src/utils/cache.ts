// Optional Redis cache. If REDIS_URL not provided, methods no-op.
import { env } from '../config/env';

type CacheClient = {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string, mode: 'EX', seconds: number) => Promise<unknown>;
  del: (key: string) => Promise<unknown>;
};

let client: CacheClient | null = null;

async function getClient(): Promise<CacheClient | null> {
  if (!env.redisUrl) return null;
  if (client) return client;
  const { default: IORedis } = await import('ioredis');
  const redis = new IORedis(env.redisUrl);
  client = {
    get: (key: string) => redis.get(key),
    set: (key: string, value: string, mode: 'EX', seconds: number) => redis.set(key, value, mode, seconds),
    del: (key: string) => redis.del(key)
  };
  return client;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const c = await getClient();
  if (!c) return null;
  const v = await c.get(key);
  if (!v) return null;
  try {
    return JSON.parse(v) as T;
  } catch {
    return null;
  }
}

export async function cacheSet<T>(key: string, value: T, ttlSeconds = 60): Promise<void> {
  const c = await getClient();
  if (!c) return;
  await c.set(key, JSON.stringify(value), 'EX', ttlSeconds);
}

export async function cacheDel(key: string): Promise<void> {
  const c = await getClient();
  if (!c) return;
  await c.del(key);
}



