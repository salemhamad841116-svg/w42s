import { AppSettings, NotificationSettings, SecuritySettings } from '../types/settings';

const APP_SETTINGS_KEY = 'inf_notes_app_settings';
const NOTIF_SETTINGS_KEY = 'inf_notes_notif_settings';
const SECURITY_SETTINGS_KEY = 'inf_notes_security_settings';
const APP_LOCKED_KEY = 'inf_notes_app_locked';

/**
 * الإعدادات الافتراضية للتطبيق
 */
const defaultAppSettings: AppSettings = {
  theme: 'dark',
  language: 'ar',
  fontSize: 15,
  fontFamily: 'Cairo',
  direction: 'rtl',
  editorAutoSave: true,
  autoSaveInterval: 5,
  showLineNumbers: false,
  autoFormatOnPaste: true
};

/**
 * الإعدادات الافتراضية للإشعارات
 */
const defaultNotifSettings: NotificationSettings = {
  enabled: true,
  reminders: true,
  taskDue: true,
  backupComplete: true,
  syncErrors: true,
  newDeviceLogin: true
};

/**
 * الإعدادات الافتراضية للأمان
 */
const defaultSecuritySettings: SecuritySettings = {
  twoFactorEnabled: false,
  pinLockEnabled: false,
  pinHash: '',
  biometricEnabled: false,
  autoLockTimeout: 0 // 0 يعني عدم القفل التلقائي
};

/**
 * جلب إعدادات التطبيق
 */
export function getAppSettings(): AppSettings {
  const settingsJson = localStorage.getItem(APP_SETTINGS_KEY);
  if (settingsJson) {
    return { ...defaultAppSettings, ...JSON.parse(settingsJson) };
  }
  return { ...defaultAppSettings };
}

/**
 * حفظ إعدادات التطبيق
 */
export function saveAppSettings(settings: AppSettings): void {
  localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(settings));
}

/**
 * جلب إعدادات الإشعارات
 */
export function getNotificationSettings(): NotificationSettings {
  const settingsJson = localStorage.getItem(NOTIF_SETTINGS_KEY);
  if (settingsJson) {
    return { ...defaultNotifSettings, ...JSON.parse(settingsJson) };
  }
  return { ...defaultNotifSettings };
}

/**
 * حفظ إعدادات الإشعارات
 */
export function saveNotificationSettings(settings: NotificationSettings): void {
  localStorage.setItem(NOTIF_SETTINGS_KEY, JSON.stringify(settings));
}

/**
 * جلب إعدادات الأمان
 */
export function getSecuritySettings(): SecuritySettings {
  const settingsJson = localStorage.getItem(SECURITY_SETTINGS_KEY);
  if (settingsJson) {
    return { ...defaultSecuritySettings, ...JSON.parse(settingsJson) };
  }
  return { ...defaultSecuritySettings };
}

/**
 * حفظ إعدادات الأمان
 */
export function saveSecuritySettings(settings: SecuritySettings): void {
  localStorage.setItem(SECURITY_SETTINGS_KEY, JSON.stringify(settings));
}

/**
 * التحقق من صحة رمز المرور (PIN)
 */
export function verifyPin(inputPin: string): boolean {
  const settings = getSecuritySettings();
  if (!settings.pinLockEnabled || !settings.pinHash) return true;
  return settings.pinHash === btoa(inputPin); // محاكاة بسيطة للتحقق
}

/**
 * تعيين رمز مرور جديد
 */
export function setPin(newPin: string): void {
  const settings = getSecuritySettings();
  settings.pinLockEnabled = true;
  settings.pinHash = btoa(newPin);
  saveSecuritySettings(settings);
}

/**
 * إزالة رمز المرور
 */
export function removePin(): void {
  const settings = getSecuritySettings();
  settings.pinLockEnabled = false;
  settings.pinHash = '';
  saveSecuritySettings(settings);
}

/**
 * التحقق مما إذا كان التطبيق مقفلاً حالياً
 */
export function isAppLocked(): boolean {
  const settings = getSecuritySettings();
  if (!settings.pinLockEnabled) return false;
  
  return localStorage.getItem(APP_LOCKED_KEY) === 'true';
}

/**
 * فتح قفل التطبيق لهذه الجلسة
 */
export function unlockApp(): void {
  localStorage.setItem(APP_LOCKED_KEY, 'false');
}

/**
 * قفل التطبيق
 */
export function lockApp(): void {
  const settings = getSecuritySettings();
  if (settings.pinLockEnabled) {
    localStorage.setItem(APP_LOCKED_KEY, 'true');
  }
}
