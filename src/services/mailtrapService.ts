/**
 * محرك إرسال البريد الإلكتروني
 * يتصل بـ /api/email/* التي يعالجها _worker.js على Cloudflare
 * أو server.ts على VPS
 */

export interface SmtpLogEntry {
  id: string;
  timestamp: string;
  type: 'verification' | 'password_reset';
  host: string;
  port: number;
  username: string;
  to: string;
  code: string;
  status: string;
}

/**
 * إنشاء سجل جديد
 */
function createLogEntry(type: 'verification' | 'password_reset', toEmail: string, code: string): SmtpLogEntry {
  const entry: SmtpLogEntry = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    type,
    host: 'Resend API',
    port: 443,
    username: 'Server',
    to: toEmail,
    code,
    status: 'Sending...',
  };
  const logs: SmtpLogEntry[] = JSON.parse(localStorage.getItem('mailtrap_smtp_logs') || '[]');
  logs.unshift(entry);
  localStorage.setItem('mailtrap_smtp_logs', JSON.stringify(logs.slice(0, 50)));
  return entry;
}

/**
 * تحديث سجل الإرسال
 */
function updateLog(entry: SmtpLogEntry, status: string): void {
  const logs: SmtpLogEntry[] = JSON.parse(localStorage.getItem('mailtrap_smtp_logs') || '[]');
  entry.status = status;
  const idx = logs.findIndex(l => l.id === entry.id);
  if (idx >= 0) logs[idx] = entry;
  localStorage.setItem('mailtrap_smtp_logs', JSON.stringify(logs.slice(0, 50)));
}

/**
 * إرسال رسالة تفعيل الحساب
 */
export async function sendVerificationEmail(toEmail: string, code: string): Promise<boolean> {
  console.log(`[Email] 🚀 Sending verification to: ${toEmail}`);
  const entry = createLogEntry('verification', toEmail, code);

  try {
    const response = await fetch('/api/email/send-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: toEmail, code }),
    });

    const data = await response.json();
    if (response.ok && data.success) {
      console.log('[Email] ✅ Verification email sent!');
      updateLog(entry, 'Delivered ✅');
      return true;
    } else {
      console.warn('[Email] ⚠️ Error:', data);
      updateLog(entry, `Failed: ${data.error || JSON.stringify(data)}`);
      return false;
    }
  } catch (err) {
    console.error('[Email] ❌ Network error:', err);
    updateLog(entry, 'Network Error ❌');
    return false;
  }
}

/**
 * إرسال رسالة إعادة تعيين كلمة المرور
 */
export async function sendPasswordResetEmail(toEmail: string, code: string): Promise<boolean> {
  console.log(`[Email] 🔑 Sending reset code to: ${toEmail}`);
  const entry = createLogEntry('password_reset', toEmail, code);

  try {
    const response = await fetch('/api/email/send-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: toEmail, code }),
    });

    const data = await response.json();
    if (response.ok && data.success) {
      console.log('[Email] ✅ Reset email sent!');
      updateLog(entry, 'Delivered ✅');
      return true;
    } else {
      console.warn('[Email] ⚠️ Error:', data);
      updateLog(entry, `Failed: ${data.error || JSON.stringify(data)}`);
      return false;
    }
  } catch (err) {
    console.error('[Email] ❌ Network error:', err);
    updateLog(entry, 'Network Error ❌');
    return false;
  }
}

/**
 * الحصول على سجلات الإرسال
 */
export function getMailtrapLogs(): SmtpLogEntry[] {
  return JSON.parse(localStorage.getItem('mailtrap_smtp_logs') || '[]');
}
