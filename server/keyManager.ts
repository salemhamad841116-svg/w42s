import { getDb } from './database.js';
import { encrypt, decrypt } from './encryption.js';
import { EventEmitter } from 'events';

export const keyEvents = new EventEmitter();

// In-Memory Cache for ultra-fast (O(1)) retrieval during trading
const keyCache: Record<string, string> = {};

/**
 * Loads all keys from SQLite into the In-Memory cache.
 * Falls back to .env if the DB is empty (migration).
 */
export function initializeKeyManager() {
  const db = getDb();
  
  // 1. Read from DB
  const rows = db.prepare(`SELECT service, encrypted_key FROM api_credentials`).all() as { service: string, encrypted_key: string }[];
  
  for (const row of rows) {
    keyCache[row.service] = decrypt(row.encrypted_key);
  }

  // 2. Load and prioritize live production environment variables (Cloud Run)
  if (process.env.GEMINI_API_KEY) {
    keyCache['gemini'] = process.env.GEMINI_API_KEY;
  }
  if (process.env.FINNHUB_API_KEY) {
    keyCache['finnhub'] = process.env.FINNHUB_API_KEY;
  }
  const binanceKey = process.env.BINANCE_API_KEY || process.env.BINANCE_KEY;
  if (binanceKey) {
    keyCache['binance'] = binanceKey;
  }
  const binanceSecret = process.env.BINANCE_SECRET || process.env.BINANCE_API_SECRET;
  if (binanceSecret) {
    keyCache['binance_secret'] = binanceSecret;
  }
  const metaApiToken = process.env.METAAPI_TOKEN || process.env.MT5_API_KEY || process.env.METAAPI_API_KEY;
  if (metaApiToken) {
    keyCache['mt5'] = metaApiToken;
  }
  const metaApiAccountId = process.env.METAAPI_LIVE_ACCOUNT_ID || process.env.METAAPI_ACCOUNT_ID || process.env.MT5_ACCOUNT_ID;
  if (metaApiAccountId) {
    keyCache['mt5_account_id'] = metaApiAccountId;
  }
  
  console.log(`🔑 KeyManager initialized. Loaded ${Object.keys(keyCache).length} keys into RAM (Live Production Ready).`);
}

export type SupportedKeyService = 'gemini' | 'finnhub' | 'mt5' | 'binance' | 'binance_secret' | 'mt5_account_id';

/**
 * Retrieves a key directly from RAM.
 */
export function getKey(service: SupportedKeyService): string {
  return keyCache[service] || '';
}

/**
 * Updates a key in RAM and encrypts/saves it to SQLite.
 * Emits an event so other services (like AI Engine) can hot-reload.
 */
export function setKey(service: SupportedKeyService, plainTextKey: string) {
  const db = getDb();
  
  // Update RAM
  keyCache[service] = plainTextKey;
  
  // Update DB (Encrypted)
  const encrypted = encrypt(plainTextKey);
  const stmt = db.prepare(`
    INSERT INTO api_credentials (service, encrypted_key, updated_at) 
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(service) DO UPDATE SET 
      encrypted_key = excluded.encrypted_key,
      updated_at = excluded.updated_at
  `);
  stmt.run(service, encrypted);
  
  console.log(`🔐 Key updated for service [${service}].`);
  
  // Notify listeners to hot-reload
  keyEvents.emit('keyUpdated', service);
}

/**
 * Returns masked keys for the Admin UI (e.g. AIzaSy...****...8Xm)
 */
export function getMaskedKeys(): Record<string, string> {
  const masked: Record<string, string> = {};
  for (const [service, key] of Object.entries(keyCache)) {
    if (!key || key.length < 10) {
      masked[service] = key; // Too short to mask meaningfully
    } else {
      const start = key.slice(0, 8);
      const end = key.slice(-4);
      masked[service] = `${start}••••••••••••${end}`;
    }
  }
  return masked;
}
