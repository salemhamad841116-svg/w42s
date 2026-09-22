export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string; // base64 data URL or empty string
  createdAt: string; // ISO
  lastLoginAt: string; // ISO
  passwordHash: string; // simulated hash
}

export interface UserSession {
  id: string;
  device: string; // browser user agent simplified
  browser: string;
  os: string;
  ip: string; // simulated
  location: string; // simulated city
  loginAt: string; // ISO
  isCurrentDevice: boolean;
}

export interface AuditLogEntry {
  id: string;
  action: string; // 'login' | 'logout' | 'password_change' | 'email_change' | 'backup_create' | etc.
  description: string;
  timestamp: string;
  device: string;
  ip: string;
}

export interface CloudBackupItem {
  id: string;
  name: string;
  createdAt: string; // ISO
  sizeBytes: number;
  noteCount: number;
  version: number;
  isAutoBackup: boolean;
  data: string; // JSON stringified notes data
}

export type SyncStatusType = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';

export interface SyncState {
  status: SyncStatusType;
  lastSyncAt: string | null;
  pendingChanges: number;
  isAutoSyncEnabled: boolean;
  isRealTimeSyncEnabled: boolean;
  syncLog: SyncLogEntry[];
}

export interface SyncLogEntry {
  id: string;
  action: string;
  timestamp: string;
  status: 'success' | 'error';
  details: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'ar' | 'en';
  fontSize: number; // 12 to 24
  fontFamily: string; // 'Cairo' | 'Tajawal' | 'Inter' | 'Amiri' | 'Outfit' | 'monospace'
  direction: 'rtl' | 'ltr';
  editorAutoSave: boolean;
  autoSaveInterval: number; // seconds
  showLineNumbers: boolean;
  autoFormatOnPaste: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  reminders: boolean;
  taskDue: boolean;
  backupComplete: boolean;
  syncErrors: boolean;
  newDeviceLogin: boolean;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  pinLockEnabled: boolean;
  pinHash: string; // simulated
  biometricEnabled: boolean;
  autoLockTimeout: number; // minutes, 0 = never
}

export interface StorageStats {
  noteCount: number;
  attachmentCount: number;
  usedBytes: number;
  totalQuotaBytes: number; // simulated 500MB
  tempCacheBytes: number;
}

export type SettingsTabId = 'profile' | 'backup' | 'sync' | 'app' | 'notifications' | 'security' | 'storage' | 'about';
