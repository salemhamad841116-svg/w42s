import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const KEY_DIR = path.resolve(import.meta.dirname, '..', 'data');
const KEY_PATH = path.join(KEY_DIR, '.master.key');

// Ensure data directory exists
if (!fs.existsSync(KEY_DIR)) {
  fs.mkdirSync(KEY_DIR, { recursive: true });
}

/**
 * Get or create the master encryption key (32 bytes for AES-256)
 */
function getMasterKey(): Buffer {
  if (fs.existsSync(KEY_PATH)) {
    const keyHex = fs.readFileSync(KEY_PATH, 'utf8').trim();
    return Buffer.from(keyHex, 'hex');
  } else {
    // Generate a new secure 32-byte key
    const newKey = crypto.randomBytes(32);
    fs.writeFileSync(KEY_PATH, newKey.toString('hex'), { mode: 0o600 }); // Secure permissions
    console.log('🔐 New Master Encryption Key generated and saved securely.');
    return newKey;
  }
}

const MASTER_KEY = getMasterKey();
const ALGORITHM = 'aes-256-gcm';

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns: iv:authTag:encryptedData (hex encoded)
 */
export function encrypt(text: string): string {
  if (!text) return '';
  const iv = crypto.randomBytes(12); // 12 bytes is standard for GCM
  const cipher = crypto.createCipheriv(ALGORITHM, MASTER_KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypt a cipher string previously encrypted by this module.
 */
export function decrypt(cipherText: string): string {
  if (!cipherText) return '';
  try {
    const parts = cipherText.split(':');
    if (parts.length !== 3) throw new Error('Invalid cipher format');
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, MASTER_KEY, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('❌ Decryption failed:', err);
    return '';
  }
}
