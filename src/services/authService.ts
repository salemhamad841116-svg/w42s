import { UserProfile, UserSession, AuditLogEntry } from '../types/settings';

const USER_KEY = 'inf_notes_user';
const SESSIONS_KEY = 'inf_notes_sessions';
const AUDIT_LOG_KEY = 'inf_notes_audit_log';

/**
 * محاكاة تشفير كلمة المرور
 */
function hashPassword(password: string): string {
  return btoa(password);
}

/**
 * توليد معرف فريد
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

/**
 * إنشاء حساب جديد
 */
export function createAccount(name: string, email: string, password: string): UserProfile {
  const newUser: UserProfile = {
    id: generateId(),
    name,
    email,
    avatar: '',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    passwordHash: hashPassword(password)
  };
  localStorage.setItem(USER_KEY, JSON.stringify(newUser));
  
  createSession();
  addAuditLog('account_create', 'تم إنشاء الحساب بنجاح');
  
  return newUser;
}

/**
 * تسجيل الدخول
 */
export function login(email: string, password: string): UserProfile | null {
  const userJson = localStorage.getItem(USER_KEY);
  if (!userJson) return null;
  
  const user: UserProfile = JSON.parse(userJson);
  if (user.email === email && user.passwordHash === hashPassword(password)) {
    user.lastLoginAt = new Date().toISOString();
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    
    createSession();
    addAuditLog('login', 'تسجيل دخول ناجح');
    return user;
  }
  
  addAuditLog('login_failed', 'محاولة تسجيل دخول فاشلة');
  return null;
}

/**
 * إنشاء جلسة جديدة (محاكاة)
 */
function createSession(): void {
  const sessions = getActiveSessions();
  const currentDeviceUserAgent = navigator.userAgent;
  
  const newSession: UserSession = {
    id: generateId(),
    device: 'Desktop',
    browser: currentDeviceUserAgent.includes('Chrome') ? 'Chrome' : 'Other',
    os: navigator.platform,
    ip: '192.168.1.' + Math.floor(Math.random() * 255),
    location: 'الرياض، السعودية',
    loginAt: new Date().toISOString(),
    isCurrentDevice: true
  };
  
  // إزالة الجلسة الحالية إن وجدت
  const filteredSessions = sessions.map(s => ({...s, isCurrentDevice: false}));
  filteredSessions.push(newSession);
  
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(filteredSessions));
}

/**
 * تسجيل الخروج
 */
export function logout(): void {
  const sessions = getActiveSessions();
  const filteredSessions = sessions.filter(s => !s.isCurrentDevice);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(filteredSessions));
  
  addAuditLog('logout', 'تسجيل خروج ناجح');
}

/**
 * تسجيل الخروج من جميع الأجهزة
 */
export function logoutAllDevices(): void {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify([]));
  addAuditLog('logout_all', 'تسجيل خروج من جميع الأجهزة');
}

/**
 * الحصول على المستخدم الحالي
 */
export function getCurrentUser(): UserProfile | null {
  const userJson = localStorage.getItem(USER_KEY);
  return userJson ? JSON.parse(userJson) : null;
}

/**
 * التحقق من حالة تسجيل الدخول
 */
export function isLoggedIn(): boolean {
  const sessions = getActiveSessions();
  return sessions.some(s => s.isCurrentDevice);
}

/**
 * تحديث الاسم
 */
export function updateName(name: string): void {
  const user = getCurrentUser();
  if (user) {
    user.name = name;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    addAuditLog('name_change', 'تم تحديث الاسم');
  }
}

/**
 * تحديث الصورة الرمزية
 */
export function updateAvatar(base64: string): void {
  const user = getCurrentUser();
  if (user) {
    user.avatar = base64;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    addAuditLog('avatar_change', 'تم تحديث الصورة الرمزية');
  }
}

/**
 * تحديث البريد الإلكتروني
 */
export function updateEmail(newEmail: string, verificationCode: string): boolean {
  // محاكاة التحقق من الكود
  if (verificationCode !== '123456') return false;
  
  const user = getCurrentUser();
  if (user) {
    user.email = newEmail;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    addAuditLog('email_change', `تم تغيير البريد الإلكتروني إلى ${newEmail}`);
    return true;
  }
  return false;
}

/**
 * تغيير كلمة المرور
 */
export function changePassword(oldPassword: string, newPassword: string): boolean {
  const user = getCurrentUser();
  if (user && user.passwordHash === hashPassword(oldPassword)) {
    user.passwordHash = hashPassword(newPassword);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    addAuditLog('password_change', 'تم تغيير كلمة المرور');
    return true;
  }
  return false;
}

/**
 * حذف الحساب
 */
export function deleteAccount(confirmEmail: string): boolean {
  const user = getCurrentUser();
  if (user && user.email === confirmEmail) {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(SESSIONS_KEY);
    localStorage.removeItem(AUDIT_LOG_KEY);
    return true;
  }
  return false;
}

/**
 * جلب الجلسات النشطة
 */
export function getActiveSessions(): UserSession[] {
  const sessionsJson = localStorage.getItem(SESSIONS_KEY);
  if (sessionsJson) {
    return JSON.parse(sessionsJson);
  }
  return [];
}

/**
 * إبطال جلسة معينة
 */
export function revokeSession(sessionId: string): void {
  const sessions = getActiveSessions();
  const filteredSessions = sessions.filter(s => s.id !== sessionId);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(filteredSessions));
  addAuditLog('session_revoked', 'تم إنهاء الجلسة ' + sessionId);
}

/**
 * إضافة سجل في سجل التدقيق
 */
export function addAuditLog(action: string, description: string): void {
  const logs = getAuditLogs();
  const newLog: AuditLogEntry = {
    id: generateId(),
    action,
    description,
    timestamp: new Date().toISOString(),
    device: navigator.userAgent.substring(0, 50),
    ip: '192.168.1.' + Math.floor(Math.random() * 255)
  };
  
  logs.unshift(newLog);
  // الاحتفاظ بآخر 100 سجل فقط
  if (logs.length > 100) logs.length = 100;
  
  localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(logs));
}

/**
 * جلب سجل التدقيق
 */
export function getAuditLogs(): AuditLogEntry[] {
  const logsJson = localStorage.getItem(AUDIT_LOG_KEY);
  if (logsJson) {
    return JSON.parse(logsJson);
  }
  return [];
}
